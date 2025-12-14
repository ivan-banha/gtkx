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

const DEPENDENCY_NAMESPACES = [
    "GLib-2.0.gir",
    "GObject-2.0.gir",
    "Gio-2.0.gir",
    "Gdk-4.0.gir",
    "Gsk-4.0.gir",
    "Pango-1.0.gir",
    "GdkPixbuf-2.0.gir",
    "Graphene-1.0.gir",
    "cairo-1.0.gir",
];

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

    const allNamespacesForRegistry: GirNamespace[] = [];
    for (const filename of DEPENDENCY_NAMESPACES) {
        const filePath = join(girsDir, filename);
        if (!existsSync(filePath)) {
            continue;
        }

        const namespace = parseGirFile(filename);
        allNamespacesForRegistry.push(namespace);
    }

    const widgetNamespaces: GirNamespace[] = [];
    for (const filename of WIDGET_NAMESPACES) {
        const filePath = join(girsDir, filename);
        if (!existsSync(filePath)) {
            console.warn(`Skipping ${filename} (not found)`);
            continue;
        }

        const namespace = parseGirFile(filename);
        console.log(`Parsed widget namespace: ${namespace.name} v${namespace.version}`);
        widgetNamespaces.push(namespace);
        allNamespacesForRegistry.push(namespace);
    }

    const combinedClassMap = new Map<string, GirClass>();
    for (const ns of widgetNamespaces) {
        const nsClassMap = buildClassMap(ns.classes);
        for (const [name, cls] of nsClassMap) {
            combinedClassMap.set(`${ns.name}.${name}`, cls);
            if (ns.name === "Gtk") {
                combinedClassMap.set(name, cls);
            }
        }
    }

    const typeRegistry = TypeRegistry.fromNamespaces(allNamespacesForRegistry);
    const typeMapper = new TypeMapper();
    for (const ns of widgetNamespaces) {
        registerEnumsFromNamespace(typeMapper, ns);
    }

    const gtkNamespace = widgetNamespaces.find((ns) => ns.name === "Gtk");
    if (!gtkNamespace) {
        throw new Error("GTK namespace is required");
    }

    typeMapper.setTypeRegistry(typeRegistry, gtkNamespace.name);
    const generator = new JsxGenerator(typeMapper, typeRegistry, combinedClassMap, {});

    console.log(`Generating JSX type definitions...`);
    const result = await generator.generate(widgetNamespaces);

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
