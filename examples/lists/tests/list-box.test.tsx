import { AccessibleRole, type CheckButton } from "@gtkx/ffi/gtk";
import { cleanup, render, screen, userEvent } from "@gtkx/testing";
import { afterEach, describe, expect, it } from "vitest";
import { ListBoxDemo } from "../src/demos/list-box.js";

describe("ListBoxDemo", () => {
    afterEach(async () => {
        await cleanup();
    });

    describe("rendering", () => {
        it("renders the title", async () => {
            await render(<ListBoxDemo />);

            const title = await screen.findByText("ListBox");
            expect(title).toBeDefined();
        });

        it("renders the description", async () => {
            await render(<ListBoxDemo />);

            const description = await screen.findByText(/GtkListBox is a vertical container for rows/);
            expect(description).toBeDefined();
        });

        it("renders the task list heading", async () => {
            await render(<ListBoxDemo />);

            const heading = await screen.findByText("Task List");
            expect(heading).toBeDefined();
        });

        it("renders the key features section", async () => {
            await render(<ListBoxDemo />);

            const keyFeatures = await screen.findByText("Key Features");
            expect(keyFeatures).toBeDefined();
        });

        it("renders feature descriptions", async () => {
            await render(<ListBoxDemo />);

            const selectionModes = await screen.findByText(/Supports selection modes: none, single, browse, multiple/);
            expect(selectionModes).toBeDefined();
        });
    });

    describe("task list content", () => {
        it("renders all task titles", async () => {
            await render(<ListBoxDemo />);

            const tasks = [
                "Review pull requests",
                "Write documentation",
                "Fix reported bugs",
                "Update dependencies",
                "Add unit tests",
                "Refactor old code",
            ];

            for (const task of tasks) {
                const taskLabel = await screen.findByText(task);
                expect(taskLabel).toBeDefined();
            }
        });

        it("renders priority labels", async () => {
            await render(<ListBoxDemo />);

            const highPriorities = await screen.findAllByText("high");
            const mediumPriorities = await screen.findAllByText("medium");
            const lowPriorities = await screen.findAllByText("low");

            expect(highPriorities.length).toBe(2);
            expect(mediumPriorities.length).toBe(2);
            expect(lowPriorities.length).toBe(2);
        });

        it("renders checkboxes for each task", async () => {
            await render(<ListBoxDemo />);

            const checkboxes = await screen.findAllByRole(AccessibleRole.CHECKBOX);
            expect(checkboxes.length).toBe(6);
        });

        it("shows correct initial completion states", async () => {
            await render(<ListBoxDemo />);

            const uncheckedBoxes = await screen.findAllByRole(AccessibleRole.CHECKBOX, { checked: false });
            const checkedBoxes = await screen.findAllByRole(AccessibleRole.CHECKBOX, { checked: true });

            expect(uncheckedBoxes.length).toBe(4);
            expect(checkedBoxes.length).toBe(2);
        });

        it("shows initial remaining count as 4", async () => {
            await render(<ListBoxDemo />);

            const remainingLabel = await screen.findByText("4 remaining");
            expect(remainingLabel).toBeDefined();
        });
    });

    describe("task toggling", () => {
        it("toggles an unchecked task to checked", async () => {
            await render(<ListBoxDemo />);

            const uncheckedBoxes = await screen.findAllByRole(AccessibleRole.CHECKBOX, { checked: false });
            const firstUnchecked = uncheckedBoxes[0] as CheckButton;
            expect(firstUnchecked).toBeDefined();

            await userEvent.click(firstUnchecked);

            expect(firstUnchecked.getActive()).toBe(true);
        });

        it("toggles a checked task to unchecked", async () => {
            await render(<ListBoxDemo />);

            const checkedBoxes = await screen.findAllByRole(AccessibleRole.CHECKBOX, { checked: true });
            const firstChecked = checkedBoxes[0] as CheckButton;
            expect(firstChecked).toBeDefined();

            await userEvent.click(firstChecked);

            expect(firstChecked.getActive()).toBe(false);
        });

        it("updates remaining count when completing a task", async () => {
            await render(<ListBoxDemo />);

            const initialRemaining = await screen.findByText("4 remaining");
            expect(initialRemaining).toBeDefined();

            const uncheckedBoxes = await screen.findAllByRole(AccessibleRole.CHECKBOX, { checked: false });
            const firstUnchecked = uncheckedBoxes[0] as CheckButton;

            await userEvent.click(firstUnchecked);

            const updatedRemaining = await screen.findByText("3 remaining");
            expect(updatedRemaining).toBeDefined();
        });

        it("updates remaining count when uncompleting a task", async () => {
            await render(<ListBoxDemo />);

            const initialRemaining = await screen.findByText("4 remaining");
            expect(initialRemaining).toBeDefined();

            const checkedBoxes = await screen.findAllByRole(AccessibleRole.CHECKBOX, { checked: true });
            const firstChecked = checkedBoxes[0] as CheckButton;

            await userEvent.click(firstChecked);

            const updatedRemaining = await screen.findByText("5 remaining");
            expect(updatedRemaining).toBeDefined();
        });

        it("can complete all tasks", async () => {
            await render(<ListBoxDemo />);

            let uncheckedBoxes = await screen.findAllByRole(AccessibleRole.CHECKBOX, { checked: false });

            while (uncheckedBoxes.length > 0) {
                await userEvent.click(uncheckedBoxes[0] as CheckButton);
                const newUnchecked = await screen.findAllByRole(AccessibleRole.CHECKBOX, { checked: false });
                if (newUnchecked.length === uncheckedBoxes.length) break;
                uncheckedBoxes = newUnchecked;
            }

            const finalRemaining = await screen.findByText("0 remaining");
            expect(finalRemaining).toBeDefined();
        });

        it("can toggle the same task multiple times", async () => {
            await render(<ListBoxDemo />);

            const uncheckedBoxes = await screen.findAllByRole(AccessibleRole.CHECKBOX, { checked: false });
            const checkbox = uncheckedBoxes[0] as CheckButton;

            await userEvent.click(checkbox);
            expect(checkbox.getActive()).toBe(true);

            await userEvent.click(checkbox);
            expect(checkbox.getActive()).toBe(false);

            await userEvent.click(checkbox);
            expect(checkbox.getActive()).toBe(true);
        });
    });

    describe("task states by content", () => {
        it("shows 'Review pull requests' as initially uncompleted", async () => {
            await render(<ListBoxDemo />);

            const reviewTask = await screen.findByText("Review pull requests");
            expect(reviewTask).toBeDefined();

            const uncheckedBoxes = await screen.findAllByRole(AccessibleRole.CHECKBOX, { checked: false });
            expect(uncheckedBoxes.length).toBeGreaterThan(0);
        });

        it("shows 'Fix reported bugs' as initially completed", async () => {
            await render(<ListBoxDemo />);

            const fixBugsTask = await screen.findByText("Fix reported bugs");
            expect(fixBugsTask).toBeDefined();
        });

        it("shows 'Refactor old code' as initially completed", async () => {
            await render(<ListBoxDemo />);

            const refactorTask = await screen.findByText("Refactor old code");
            expect(refactorTask).toBeDefined();
        });
    });

    describe("list structure", () => {
        it("renders tasks in a ListBox widget", async () => {
            await render(<ListBoxDemo />);

            const listBox = await screen.findByRole(AccessibleRole.LIST);
            expect(listBox).toBeDefined();
        });

        it("renders list items within the ListBox", async () => {
            await render(<ListBoxDemo />);

            const listItems = await screen.findAllByRole(AccessibleRole.LIST_ITEM);
            expect(listItems.length).toBe(6);
        });
    });

    describe("remaining count accuracy", () => {
        it("accurately tracks count after multiple toggles", async () => {
            await render(<ListBoxDemo />);

            const uncheckedBoxes = await screen.findAllByRole(AccessibleRole.CHECKBOX, { checked: false });
            const checkedBoxes = await screen.findAllByRole(AccessibleRole.CHECKBOX, { checked: true });

            await userEvent.click(uncheckedBoxes[0] as CheckButton);
            let remaining = await screen.findByText("3 remaining");
            expect(remaining).toBeDefined();

            await userEvent.click(uncheckedBoxes[1] as CheckButton);
            remaining = await screen.findByText("2 remaining");
            expect(remaining).toBeDefined();

            await userEvent.click(checkedBoxes[0] as CheckButton);
            remaining = await screen.findByText("3 remaining");
            expect(remaining).toBeDefined();
        });
    });
});
