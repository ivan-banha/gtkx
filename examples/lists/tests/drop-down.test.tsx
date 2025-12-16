import { AccessibleRole, type DropDown } from "@gtkx/ffi/gtk";
import { cleanup, render, screen, userEvent } from "@gtkx/testing";
import { afterEach, describe, expect, it } from "vitest";
import { DropDownDemo } from "../src/demos/drop-down.js";

describe("DropDownDemo", () => {
    afterEach(async () => {
        await cleanup();
    });

    describe("rendering", () => {
        it("renders the title", async () => {
            await render(<DropDownDemo />);

            const title = await screen.findByText("DropDown");
            expect(title).toBeDefined();
        });

        it("renders the description", async () => {
            await render(<DropDownDemo />);

            const description = await screen.findByText(/GtkDropDown is a modern replacement for combo boxes/);
            expect(description).toBeDefined();
        });

        it("renders key features section", async () => {
            await render(<DropDownDemo />);

            const keyFeatures = await screen.findByText("Key Features");
            expect(keyFeatures).toBeDefined();
        });
    });

    describe("framework selector", () => {
        it("renders framework selector heading", async () => {
            await render(<DropDownDemo />);

            const heading = await screen.findByText("Framework Selector");
            expect(heading).toBeDefined();
        });

        it("renders framework dropdown widget", async () => {
            await render(<DropDownDemo />);

            const dropdowns = await screen.findAllByRole(AccessibleRole.COMBO_BOX);
            expect(dropdowns.length).toBeGreaterThanOrEqual(1);
        });

        it("selects React framework and shows details", async () => {
            await render(<DropDownDemo />);

            const dropdowns = await screen.findAllByRole(AccessibleRole.COMBO_BOX);
            const frameworkDropdown = dropdowns[0] as DropDown;

            await userEvent.selectOptions(frameworkDropdown, 0);

            const language = await screen.findByText("Language: JavaScript");
            const description = await screen.findByText("A library for building user interfaces");

            expect(language).toBeDefined();
            expect(description).toBeDefined();
        });

        it("selects Vue framework and shows details", async () => {
            await render(<DropDownDemo />);

            const dropdowns = await screen.findAllByRole(AccessibleRole.COMBO_BOX);
            const frameworkDropdown = dropdowns[0] as DropDown;

            await userEvent.selectOptions(frameworkDropdown, 1);

            const description = await screen.findByText("The progressive JavaScript framework");
            expect(description).toBeDefined();
        });

        it("selects Angular framework and shows TypeScript language", async () => {
            await render(<DropDownDemo />);

            const dropdowns = await screen.findAllByRole(AccessibleRole.COMBO_BOX);
            const frameworkDropdown = dropdowns[0] as DropDown;

            await userEvent.selectOptions(frameworkDropdown, 2);

            const language = await screen.findByText("Language: TypeScript");
            expect(language).toBeDefined();
        });

        it("selects GTK framework and shows C language", async () => {
            await render(<DropDownDemo />);

            const dropdowns = await screen.findAllByRole(AccessibleRole.COMBO_BOX);
            const frameworkDropdown = dropdowns[0] as DropDown;

            await userEvent.selectOptions(frameworkDropdown, 5);

            const language = await screen.findByText("Language: C");
            const description = await screen.findByText("Cross-platform toolkit for creating GUIs");

            expect(language).toBeDefined();
            expect(description).toBeDefined();
        });

        it("selects Flutter framework and shows Dart language", async () => {
            await render(<DropDownDemo />);

            const dropdowns = await screen.findAllByRole(AccessibleRole.COMBO_BOX);
            const frameworkDropdown = dropdowns[0] as DropDown;

            await userEvent.selectOptions(frameworkDropdown, 7);

            const language = await screen.findByText("Language: Dart");
            expect(language).toBeDefined();
        });

        it("can change framework selection", async () => {
            await render(<DropDownDemo />);

            const dropdowns = await screen.findAllByRole(AccessibleRole.COMBO_BOX);
            const frameworkDropdown = dropdowns[0] as DropDown;

            await userEvent.selectOptions(frameworkDropdown, 0);
            const reactDesc = await screen.findByText("A library for building user interfaces");
            expect(reactDesc).toBeDefined();

            await userEvent.selectOptions(frameworkDropdown, 3);
            const svelteDesc = await screen.findByText("Cybernetically enhanced web apps");
            expect(svelteDesc).toBeDefined();
        });
    });

    describe("theme selector", () => {
        it("renders theme preference heading", async () => {
            await render(<DropDownDemo />);

            const heading = await screen.findByText("Theme Preference");
            expect(heading).toBeDefined();
        });

        it("renders select theme label", async () => {
            await render(<DropDownDemo />);

            const label = await screen.findByText("Select theme:");
            expect(label).toBeDefined();
        });

        it("renders theme dropdown widget", async () => {
            await render(<DropDownDemo />);

            const dropdowns = await screen.findAllByRole(AccessibleRole.COMBO_BOX);
            expect(dropdowns.length).toBeGreaterThanOrEqual(2);
        });

        it("shows System Default as initially selected", async () => {
            await render(<DropDownDemo />);

            const selected = await screen.findByText("Selected: System Default");
            expect(selected).toBeDefined();
        });

        it("selects Dark theme and shows selection", async () => {
            await render(<DropDownDemo />);

            const dropdowns = await screen.findAllByRole(AccessibleRole.COMBO_BOX);
            const themeDropdown = dropdowns[1] as DropDown;

            await userEvent.selectOptions(themeDropdown, 1);

            const selected = await screen.findByText("Selected: Dark");
            expect(selected).toBeDefined();
        });
    });

    describe("feature documentation", () => {
        it("mentions modern replacement for GtkComboBox", async () => {
            await render(<DropDownDemo />);

            const feature = await screen.findByText(/Modern replacement for GtkComboBox/);
            expect(feature).toBeDefined();
        });

        it("mentions id and label props", async () => {
            await render(<DropDownDemo />);

            const feature = await screen.findByText(/id and label props for items/);
            expect(feature).toBeDefined();
        });

        it("mentions onSelectionChanged callback", async () => {
            await render(<DropDownDemo />);

            const feature = await screen.findByText(/onSelectionChanged callback returns selected ID/);
            expect(feature).toBeDefined();
        });

        it("mentions keyboard navigation", async () => {
            await render(<DropDownDemo />);

            const feature = await screen.findByText(/Built-in keyboard navigation/);
            expect(feature).toBeDefined();
        });

        it("mentions search filtering", async () => {
            await render(<DropDownDemo />);

            const feature = await screen.findByText(/Search filtering support/);
            expect(feature).toBeDefined();
        });
    });

    describe("framework data integrity", () => {
        it("has 8 framework options", async () => {
            await render(<DropDownDemo />);

            const dropdowns = await screen.findAllByRole(AccessibleRole.COMBO_BOX);
            const frameworkDropdown = dropdowns[0] as DropDown;

            await userEvent.selectOptions(frameworkDropdown, 7);
            expect(frameworkDropdown.getSelected()).toBe(7);
        });

        it("displays SolidJS with correct description", async () => {
            await render(<DropDownDemo />);

            const dropdowns = await screen.findAllByRole(AccessibleRole.COMBO_BOX);
            const frameworkDropdown = dropdowns[0] as DropDown;

            await userEvent.selectOptions(frameworkDropdown, 4);

            const description = await screen.findByText("Simple and performant reactivity");
            expect(description).toBeDefined();
        });

        it("displays Qt with C++ language", async () => {
            await render(<DropDownDemo />);

            const dropdowns = await screen.findAllByRole(AccessibleRole.COMBO_BOX);
            const frameworkDropdown = dropdowns[0] as DropDown;

            await userEvent.selectOptions(frameworkDropdown, 6);

            const language = await screen.findByText("Language: C++");
            const description = await screen.findByText("Cross-platform application framework");

            expect(language).toBeDefined();
            expect(description).toBeDefined();
        });
    });

    describe("dropdown selection index", () => {
        it("updates selected index correctly for framework dropdown", async () => {
            await render(<DropDownDemo />);

            const dropdowns = await screen.findAllByRole(AccessibleRole.COMBO_BOX);
            const frameworkDropdown = dropdowns[0] as DropDown;

            await userEvent.selectOptions(frameworkDropdown, 3);
            expect(frameworkDropdown.getSelected()).toBe(3);

            await userEvent.selectOptions(frameworkDropdown, 5);
            expect(frameworkDropdown.getSelected()).toBe(5);
        });

        it("updates selected index correctly for theme dropdown", async () => {
            await render(<DropDownDemo />);

            const dropdowns = await screen.findAllByRole(AccessibleRole.COMBO_BOX);
            const themeDropdown = dropdowns[1] as DropDown;

            await userEvent.selectOptions(themeDropdown, 0);
            expect(themeDropdown.getSelected()).toBe(0);

            await userEvent.selectOptions(themeDropdown, 1);
            expect(themeDropdown.getSelected()).toBe(1);
        });
    });
});
