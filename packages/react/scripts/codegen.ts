import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { GirClass, GirNamespace } from "@gtkx/gir";
import { buildClassMap, GirParser, registerEnumsFromNamespace, TypeMapper, TypeRegistry } from "@gtkx/gir";
import { JsxGenerator } from "../src/codegen/jsx-generator.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const workspaceRoot = resolve(__dirname, "../../..");
const girsDir = join(workspaceRoot, "girs");
const outputDir = resolve(__dirname, "../src/generated");
const jsxOutputFile = resolve(outputDir, "jsx.ts");
const internalOutputFile = resolve(outputDir, "internal.ts");

const WIDGET_NAMESPACES = ["Gtk-4.0.gir", "Adw-1.gir"];

const parseGirFile = (filename: string): GirNamespace => {
    const filePath = join(girsDir, filename);
    console.log(`Reading GIR file: ${filePath}`);
    const girContent = readFileSync(filePath, "utf-8");
    const parser = new GirParser();
    return parser.parse(girContent);
};

const generateJsxTypes = async (): Promise<void> => {
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
        console.log(`Created output directory: ${outputDir}`);
    }

    const namespaces: GirNamespace[] = [];
    for (const filename of WIDGET_NAMESPACES) {
        const filePath = join(girsDir, filename);
        if (!existsSync(filePath)) {
            console.warn(`Skipping ${filename} (not found)`);
            continue;
        }

        const namespace = parseGirFile(filename);
        console.log(`Parsed namespace: ${namespace.name} v${namespace.version}`);
        namespaces.push(namespace);
    }

    const combinedClassMap = new Map<string, GirClass>();
    for (const ns of namespaces) {
        const nsClassMap = buildClassMap(ns.classes);
        for (const [name, cls] of nsClassMap) {
            combinedClassMap.set(`${ns.name}.${name}`, cls);
            if (ns.name === "Gtk") {
                combinedClassMap.set(name, cls);
            }
        }
    }

    const typeRegistry = TypeRegistry.fromNamespaces(namespaces);
    const typeMapper = new TypeMapper();
    for (const ns of namespaces) {
        registerEnumsFromNamespace(typeMapper, ns);
    }

    const gtkNamespace = namespaces.find((ns) => ns.name === "Gtk");
    if (!gtkNamespace) {
        throw new Error("GTK namespace is required");
    }

    typeMapper.setTypeRegistry(typeRegistry, gtkNamespace.name);
    const generator = new JsxGenerator(typeMapper, typeRegistry, combinedClassMap, {});

    console.log(`Generating JSX type definitions...`);
    const result = await generator.generate(namespaces);

    console.log(`Writing ${jsxOutputFile}`);
    writeFileSync(jsxOutputFile, result.jsx);

    console.log(`Writing ${internalOutputFile}`);
    writeFileSync(internalOutputFile, result.internal);

    console.log("✓ JSX type generation complete!");
};

const main = async (): Promise<void> => {
    try {
        await generateJsxTypes();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

await main();
