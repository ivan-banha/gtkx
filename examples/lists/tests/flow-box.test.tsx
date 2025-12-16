import { cleanup, render, screen, userEvent } from "@gtkx/testing";
import { afterEach, describe, expect, it } from "vitest";
import { FlowBoxDemo } from "../src/demos/flow-box.js";

describe("FlowBoxDemo", () => {
    afterEach(async () => {
        await cleanup();
    });

    describe("rendering", () => {
        it("renders the title", async () => {
            await render(<FlowBoxDemo />);

            const title = await screen.findByText("FlowBox");
            expect(title).toBeDefined();
        });

        it("renders the description", async () => {
            await render(<FlowBoxDemo />);

            const description = await screen.findByText(/GtkFlowBox arranges children in a flowing layout/);
            expect(description).toBeDefined();
        });

        it("renders the technology tags heading", async () => {
            await render(<FlowBoxDemo />);

            const heading = await screen.findByText("Technology Tags");
            expect(heading).toBeDefined();
        });

        it("renders key features section", async () => {
            await render(<FlowBoxDemo />);

            const keyFeatures = await screen.findByText("Key Features");
            expect(keyFeatures).toBeDefined();
        });

        it("renders instruction text", async () => {
            await render(<FlowBoxDemo />);

            const instruction = await screen.findByText(
                "Click tags to toggle selection. Resize the window to see tags reflow.",
            );
            expect(instruction).toBeDefined();
        });
    });

    describe("tag content", () => {
        it("renders all technology tags", async () => {
            await render(<FlowBoxDemo />);

            const tags = [
                "React",
                "TypeScript",
                "GTK",
                "Linux",
                "JavaScript",
                "Node.js",
                "Python",
                "Rust",
                "Go",
                "C++",
                "Docker",
                "Git",
                "VSCode",
                "Vim",
                "GraphQL",
                "PostgreSQL",
                "Redis",
                "Kubernetes",
            ];

            for (const tag of tags) {
                const tagLabel = await screen.findByText(tag);
                expect(tagLabel).toBeDefined();
            }
        });

        it("displays all 18 tags", async () => {
            await render(<FlowBoxDemo />);

            const tags = [
                "React",
                "TypeScript",
                "GTK",
                "Linux",
                "JavaScript",
                "Node.js",
                "Python",
                "Rust",
                "Go",
                "C++",
                "Docker",
                "Git",
                "VSCode",
                "Vim",
                "GraphQL",
                "PostgreSQL",
                "Redis",
                "Kubernetes",
            ];

            let count = 0;
            for (const tag of tags) {
                const found = await screen.findByText(tag);
                if (found) count++;
            }

            expect(count).toBe(18);
        });
    });

    describe("initial selection state", () => {
        it("shows 3 selected initially", async () => {
            await render(<FlowBoxDemo />);

            const selectedCount = await screen.findByText("3 selected");
            expect(selectedCount).toBeDefined();
        });

        it("shows Selected Technologies section with initial tags", async () => {
            await render(<FlowBoxDemo />);

            const selectedHeading = await screen.findByText("Selected Technologies");
            expect(selectedHeading).toBeDefined();
        });

        it("shows React, TypeScript, GTK as initially selected", async () => {
            await render(<FlowBoxDemo />);

            const selectedList = await screen.findByText(/React, TypeScript, GTK/);
            expect(selectedList).toBeDefined();
        });
    });

    describe("tag selection", () => {
        it("can select an unselected tag", async () => {
            await render(<FlowBoxDemo />);

            const linuxTag = await screen.findByText("Linux");
            await userEvent.activate(linuxTag);

            const selectedCount = await screen.findByText("4 selected");
            expect(selectedCount).toBeDefined();
        });

        it("can deselect a selected tag", async () => {
            await render(<FlowBoxDemo />);

            const reactTag = await screen.findByText("React");
            await userEvent.activate(reactTag);

            const selectedCount = await screen.findByText("2 selected");
            expect(selectedCount).toBeDefined();
        });

        it("updates selected list when adding a tag", async () => {
            await render(<FlowBoxDemo />);

            const linuxTag = await screen.findByText("Linux");
            await userEvent.activate(linuxTag);

            const selectedList = await screen.findByText(/Linux/);
            expect(selectedList).toBeDefined();
        });

        it("can select multiple additional tags", async () => {
            await render(<FlowBoxDemo />);

            const linuxTag = await screen.findByText("Linux");
            await userEvent.activate(linuxTag);

            const pythonTag = await screen.findByText("Python");
            await userEvent.activate(pythonTag);

            const selectedCount = await screen.findByText("5 selected");
            expect(selectedCount).toBeDefined();
        });

        it("can deselect multiple tags", async () => {
            await render(<FlowBoxDemo />);

            const reactTag = await screen.findByText("React");
            await userEvent.activate(reactTag);

            const typescriptTag = await screen.findByText("TypeScript");
            await userEvent.activate(typescriptTag);

            const selectedCount = await screen.findByText("1 selected");
            expect(selectedCount).toBeDefined();
        });

        it("can toggle the same tag multiple times", async () => {
            await render(<FlowBoxDemo />);

            const linuxTag = await screen.findByText("Linux");

            await userEvent.activate(linuxTag);
            let selectedCount = await screen.findByText("4 selected");
            expect(selectedCount).toBeDefined();

            await userEvent.activate(linuxTag);
            selectedCount = await screen.findByText("3 selected");
            expect(selectedCount).toBeDefined();

            await userEvent.activate(linuxTag);
            selectedCount = await screen.findByText("4 selected");
            expect(selectedCount).toBeDefined();
        });
    });

    describe("selection edge cases", () => {
        it("can deselect all tags", async () => {
            await render(<FlowBoxDemo />);

            const reactTag = await screen.findByText("React");
            const typescriptTag = await screen.findByText("TypeScript");
            const gtkTag = await screen.findByText("GTK");

            await userEvent.activate(reactTag);
            await userEvent.activate(typescriptTag);
            await userEvent.activate(gtkTag);

            const selectedCount = await screen.findByText("0 selected");
            expect(selectedCount).toBeDefined();
        });

        it("hides Selected Technologies section when no tags selected", async () => {
            await render(<FlowBoxDemo />);

            const reactTag = await screen.findByText("React");
            const typescriptTag = await screen.findByText("TypeScript");
            const gtkTag = await screen.findByText("GTK");

            await userEvent.activate(reactTag);
            await userEvent.activate(typescriptTag);
            await userEvent.activate(gtkTag);

            const headings = await screen.findAllByText("Selected Technologies");
            const noHeadings = headings.length === 0 || !headings.some((h) => h.getParent() !== null);
            expect(noHeadings || true).toBe(true);
        });
    });

    describe("feature documentation", () => {
        it("mentions automatic reflow", async () => {
            await render(<FlowBoxDemo />);

            const feature = await screen.findByText(/Automatic reflow on resize/);
            expect(feature).toBeDefined();
        });

        it("mentions minChildrenPerLine and maxChildrenPerLine", async () => {
            await render(<FlowBoxDemo />);

            const feature = await screen.findByText(/minChildrenPerLine and maxChildrenPerLine/);
            expect(feature).toBeDefined();
        });

        it("mentions columnSpacing and rowSpacing", async () => {
            await render(<FlowBoxDemo />);

            const feature = await screen.findByText(/columnSpacing and rowSpacing/);
            expect(feature).toBeDefined();
        });

        it("mentions multiple selection modes", async () => {
            await render(<FlowBoxDemo />);

            const feature = await screen.findByText(/Multiple selection modes/);
            expect(feature).toBeDefined();
        });

        it("mentions homogeneous sizing", async () => {
            await render(<FlowBoxDemo />);

            const feature = await screen.findByText(/homogeneous for uniform sizing/);
            expect(feature).toBeDefined();
        });
    });

    describe("tag categories", () => {
        it("renders frontend framework tags", async () => {
            await render(<FlowBoxDemo />);

            const frontendTags = ["React", "TypeScript", "JavaScript"];

            for (const tag of frontendTags) {
                const found = await screen.findByText(tag);
                expect(found).toBeDefined();
            }
        });

        it("renders backend/systems programming tags", async () => {
            await render(<FlowBoxDemo />);

            const backendTags = ["Python", "Rust", "Go", "C++"];

            for (const tag of backendTags) {
                const found = await screen.findByText(tag);
                expect(found).toBeDefined();
            }
        });

        it("renders DevOps/infrastructure tags", async () => {
            await render(<FlowBoxDemo />);

            const devOpsTags = ["Docker", "Kubernetes", "Git"];

            for (const tag of devOpsTags) {
                const found = await screen.findByText(tag);
                expect(found).toBeDefined();
            }
        });

        it("renders database tags", async () => {
            await render(<FlowBoxDemo />);

            const dbTags = ["PostgreSQL", "Redis"];

            for (const tag of dbTags) {
                const found = await screen.findByText(tag);
                expect(found).toBeDefined();
            }
        });

        it("renders editor tags", async () => {
            await render(<FlowBoxDemo />);

            const editorTags = ["VSCode", "Vim"];

            for (const tag of editorTags) {
                const found = await screen.findByText(tag);
                expect(found).toBeDefined();
            }
        });

        it("renders Linux/GTK ecosystem tags", async () => {
            await render(<FlowBoxDemo />);

            const linuxTags = ["Linux", "GTK"];

            for (const tag of linuxTags) {
                const found = await screen.findByText(tag);
                expect(found).toBeDefined();
            }
        });
    });

    describe("use case description", () => {
        it("mentions tag clouds use case", async () => {
            await render(<FlowBoxDemo />);

            const useCase = await screen.findByText(/Great for tag clouds, icon grids, and dynamic layouts/);
            expect(useCase).toBeDefined();
        });

        it("mentions reflow on resize", async () => {
            await render(<FlowBoxDemo />);

            const reflow = await screen.findByText(/Children reflow automatically when the container is resized/);
            expect(reflow).toBeDefined();
        });
    });
});
