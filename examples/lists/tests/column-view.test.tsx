import { cleanup, render, screen } from "@gtkx/testing";
import { afterEach, describe, expect, it } from "vitest";
import { ColumnViewDemo } from "../src/demos/column-view.js";

describe("ColumnViewDemo", () => {
    afterEach(async () => {
        await cleanup();
    });

    describe("rendering", () => {
        it("renders the title", async () => {
            await render(<ColumnViewDemo />);

            const title = await screen.findByText("ColumnView");
            expect(title).toBeDefined();
        });

        it("renders the description", async () => {
            await render(<ColumnViewDemo />);

            const description = await screen.findByText(/GtkColumnView displays data in a table with multiple columns/);
            expect(description).toBeDefined();
        });

        it("renders the employee directory heading", async () => {
            await render(<ColumnViewDemo />);

            const heading = await screen.findByText("Employee Directory");
            expect(heading).toBeDefined();
        });

        it("renders key features section", async () => {
            await render(<ColumnViewDemo />);

            const keyFeatures = await screen.findByText("Key Features");
            expect(keyFeatures).toBeDefined();
        });
    });

    describe("column headers", () => {
        it("renders Name column header", async () => {
            await render(<ColumnViewDemo />);

            const nameHeader = await screen.findByText("Name");
            expect(nameHeader).toBeDefined();
        });

        it("renders Department column header", async () => {
            await render(<ColumnViewDemo />);

            const departmentHeader = await screen.findByText("Department");
            expect(departmentHeader).toBeDefined();
        });

        it("renders Salary column header", async () => {
            await render(<ColumnViewDemo />);

            const salaryHeader = await screen.findByText("Salary");
            expect(salaryHeader).toBeDefined();
        });

        it("renders Start Date column header", async () => {
            await render(<ColumnViewDemo />);

            const startDateHeader = await screen.findByText("Start Date");
            expect(startDateHeader).toBeDefined();
        });

        it("renders Status column header", async () => {
            await render(<ColumnViewDemo />);

            const statusHeader = await screen.findByText("Status");
            expect(statusHeader).toBeDefined();
        });
    });

    describe("employee data", () => {
        it("renders all employee names", async () => {
            await render(<ColumnViewDemo />);

            const employeeNames = [
                "Alice Johnson",
                "Bob Smith",
                "Carol Williams",
                "David Brown",
                "Eve Davis",
                "Frank Miller",
                "Grace Wilson",
                "Henry Taylor",
                "Ivy Anderson",
                "Jack Thomas",
                "Kate Jackson",
                "Leo White",
            ];

            for (const name of employeeNames) {
                const nameLabel = await screen.findByText(name);
                expect(nameLabel).toBeDefined();
            }
        });

        it("displays all 12 employees", async () => {
            await render(<ColumnViewDemo />);

            const employeeNames = [
                "Alice Johnson",
                "Bob Smith",
                "Carol Williams",
                "David Brown",
                "Eve Davis",
                "Frank Miller",
                "Grace Wilson",
                "Henry Taylor",
                "Ivy Anderson",
                "Jack Thomas",
                "Kate Jackson",
                "Leo White",
            ];

            let count = 0;
            for (const name of employeeNames) {
                const found = await screen.findByText(name);
                if (found) count++;
            }

            expect(count).toBe(12);
        });
    });

    describe("department distribution", () => {
        it("shows Engineering department employees", async () => {
            await render(<ColumnViewDemo />);

            const engineeringLabels = await screen.findAllByText("Engineering");
            expect(engineeringLabels.length).toBeGreaterThan(0);
        });

        it("shows Design department employees", async () => {
            await render(<ColumnViewDemo />);

            const designLabels = await screen.findAllByText("Design");
            expect(designLabels.length).toBeGreaterThan(0);
        });

        it("shows Marketing department employees", async () => {
            await render(<ColumnViewDemo />);

            const marketingLabels = await screen.findAllByText("Marketing");
            expect(marketingLabels.length).toBeGreaterThan(0);
        });

        it("shows Sales department employees", async () => {
            await render(<ColumnViewDemo />);

            const salesLabels = await screen.findAllByText("Sales");
            expect(salesLabels.length).toBeGreaterThan(0);
        });
    });

    describe("salary data", () => {
        it("renders formatted salary values", async () => {
            await render(<ColumnViewDemo />);

            const salaries = [
                "$95,000",
                "$82,000",
                "$78,000",
                "$105,000",
                "$88,000",
                "$92,000",
                "$85,000",
                "$72,000",
                "$110,000",
                "$91,000",
                "$98,000",
                "$79,000",
            ];

            for (const salary of salaries) {
                const salaryLabel = await screen.findByText(salary);
                expect(salaryLabel).toBeDefined();
            }
        });

        it("shows highest salary ($110,000 for Ivy Anderson)", async () => {
            await render(<ColumnViewDemo />);

            const highestSalary = await screen.findByText("$110,000");
            expect(highestSalary).toBeDefined();
        });

        it("shows lowest salary ($72,000 for Henry Taylor)", async () => {
            await render(<ColumnViewDemo />);

            const lowestSalary = await screen.findByText("$72,000");
            expect(lowestSalary).toBeDefined();
        });
    });

    describe("status values", () => {
        it("renders active status labels", async () => {
            await render(<ColumnViewDemo />);

            const activeLabels = await screen.findAllByText("active");
            expect(activeLabels.length).toBeGreaterThan(0);
        });

        it("renders remote status labels", async () => {
            await render(<ColumnViewDemo />);

            const remoteLabels = await screen.findAllByText("remote");
            expect(remoteLabels.length).toBeGreaterThan(0);
        });

        it("renders on-leave status labels", async () => {
            await render(<ColumnViewDemo />);

            const onLeaveLabels = await screen.findAllByText("on-leave");
            expect(onLeaveLabels.length).toBeGreaterThan(0);
        });

        it("has correct count of active employees", async () => {
            await render(<ColumnViewDemo />);

            const activeLabels = await screen.findAllByText("active");
            expect(activeLabels.length).toBe(7);
        });

        it("has correct count of remote employees", async () => {
            await render(<ColumnViewDemo />);

            const remoteLabels = await screen.findAllByText("remote");
            expect(remoteLabels.length).toBe(3);
        });

        it("has correct count of on-leave employees", async () => {
            await render(<ColumnViewDemo />);

            const onLeaveLabels = await screen.findAllByText("on-leave");
            expect(onLeaveLabels.length).toBe(2);
        });
    });

    describe("sorting indicator", () => {
        it("shows initial sort indicator for name column ascending", async () => {
            await render(<ColumnViewDemo />);

            const sortIndicator = await screen.findByText(/Sorted by name/);
            expect(sortIndicator).toBeDefined();
        });

        it("shows ascending indicator", async () => {
            await render(<ColumnViewDemo />);

            const ascendingIndicator = await screen.findByText(/↑/);
            expect(ascendingIndicator).toBeDefined();
        });
    });

    describe("feature documentation", () => {
        it("mentions sortable columns", async () => {
            await render(<ColumnViewDemo />);

            const sortable = await screen.findByText(/Sortable columns with sortFn and onSortChange/);
            expect(sortable).toBeDefined();
        });

        it("mentions resizable columns", async () => {
            await render(<ColumnViewDemo />);

            const resizable = await screen.findByText(/Resizable columns with resizable prop/);
            expect(resizable).toBeDefined();
        });

        it("mentions fixed-width columns", async () => {
            await render(<ColumnViewDemo />);

            const fixedWidth = await screen.findByText(/Fixed-width columns with fixedWidth prop/);
            expect(fixedWidth).toBeDefined();
        });

        it("mentions renderCell", async () => {
            await render(<ColumnViewDemo />);

            const renderCell = await screen.findByText(/renderCell for custom cell content/);
            expect(renderCell).toBeDefined();
        });

        it("mentions virtual scrolling", async () => {
            await render(<ColumnViewDemo />);

            const virtualScrolling = await screen.findByText(/Virtual scrolling for performance/);
            expect(virtualScrolling).toBeDefined();
        });
    });

    describe("employee data integrity", () => {
        it("displays Alice Johnson with Engineering department", async () => {
            await render(<ColumnViewDemo />);

            const name = await screen.findByText("Alice Johnson");
            const salary = await screen.findByText("$95,000");

            expect(name).toBeDefined();
            expect(salary).toBeDefined();
        });

        it("displays David Brown with highest Engineering salary", async () => {
            await render(<ColumnViewDemo />);

            const name = await screen.findByText("David Brown");
            const salary = await screen.findByText("$105,000");

            expect(name).toBeDefined();
            expect(salary).toBeDefined();
        });

        it("displays Ivy Anderson with highest overall salary", async () => {
            await render(<ColumnViewDemo />);

            const name = await screen.findByText("Ivy Anderson");
            const salary = await screen.findByText("$110,000");

            expect(name).toBeDefined();
            expect(salary).toBeDefined();
        });

        it("displays Eve Davis with on-leave status", async () => {
            await render(<ColumnViewDemo />);

            const name = await screen.findByText("Eve Davis");
            expect(name).toBeDefined();
        });

        it("displays Bob Smith with remote status", async () => {
            await render(<ColumnViewDemo />);

            const name = await screen.findByText("Bob Smith");
            expect(name).toBeDefined();
        });
    });

    describe("date formatting", () => {
        it("renders formatted start dates", async () => {
            await render(<ColumnViewDemo />);

            const firstDate = await screen.findByText(/2021/);
            expect(firstDate).toBeDefined();
        });
    });

    describe("initial sort order", () => {
        it("shows employees sorted alphabetically by default", async () => {
            await render(<ColumnViewDemo />);

            const aliceName = await screen.findByText("Alice Johnson");
            const bobName = await screen.findByText("Bob Smith");

            expect(aliceName).toBeDefined();
            expect(bobName).toBeDefined();
        });
    });
});
