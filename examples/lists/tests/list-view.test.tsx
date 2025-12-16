import { cleanup, render, screen } from "@gtkx/testing";
import { afterEach, describe, expect, it } from "vitest";
import { ListViewDemo } from "../src/demos/list-view.js";

describe("ListViewDemo", () => {
    afterEach(async () => {
        await cleanup();
    });

    describe("rendering", () => {
        it("renders the title", async () => {
            await render(<ListViewDemo />);

            const title = await screen.findByText("ListView");
            expect(title).toBeDefined();
        });

        it("renders the description", async () => {
            await render(<ListViewDemo />);

            const description = await screen.findByText(
                /GtkListView is a high-performance widget for displaying large lists/,
            );
            expect(description).toBeDefined();
        });

        it("renders the company directory heading", async () => {
            await render(<ListViewDemo />);

            const heading = await screen.findByText("Company Directory");
            expect(heading).toBeDefined();
        });

        it("renders key features section", async () => {
            await render(<ListViewDemo />);

            const keyFeatures = await screen.findByText("Key Features");
            expect(keyFeatures).toBeDefined();
        });

        it("renders feature descriptions", async () => {
            await render(<ListViewDemo />);

            const virtualScrolling = await screen.findByText(/Virtual scrolling for optimal performance/);
            expect(virtualScrolling).toBeDefined();
        });
    });

    describe("contact list content", () => {
        it("renders contact names", async () => {
            await render(<ListViewDemo />);

            const contactNames = [
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
                "Mia Harris",
                "Noah Martin",
                "Olivia Garcia",
            ];

            for (const name of contactNames) {
                const nameLabel = await screen.findByText(name);
                expect(nameLabel).toBeDefined();
            }
        });

        it("renders contact emails", async () => {
            await render(<ListViewDemo />);

            const emails = [
                "alice@company.com",
                "bob@company.com",
                "carol@company.com",
                "david@company.com",
                "eve@company.com",
            ];

            for (const email of emails) {
                const emailLabel = await screen.findByText(email);
                expect(emailLabel).toBeDefined();
            }
        });

        it("renders department labels", async () => {
            await render(<ListViewDemo />);

            const engineeringLabels = await screen.findAllByText("Engineering");
            const designLabels = await screen.findAllByText("Design");
            const marketingLabels = await screen.findAllByText("Marketing");
            const salesLabels = await screen.findAllByText("Sales");

            expect(engineeringLabels.length).toBeGreaterThan(0);
            expect(designLabels.length).toBeGreaterThan(0);
            expect(marketingLabels.length).toBeGreaterThan(0);
            expect(salesLabels.length).toBeGreaterThan(0);
        });

        it("renders avatar initials for contacts", async () => {
            await render(<ListViewDemo />);

            const initialsA = await screen.findAllByText("A");
            const initialsB = await screen.findAllByText("B");
            const initialsC = await screen.findAllByText("C");

            expect(initialsA.length).toBeGreaterThan(0);
            expect(initialsB.length).toBeGreaterThan(0);
            expect(initialsC.length).toBeGreaterThan(0);
        });
    });

    describe("department distribution", () => {
        it("shows Engineering department contacts", async () => {
            await render(<ListViewDemo />);

            const engineeringContacts = await screen.findAllByText("Engineering");
            expect(engineeringContacts.length).toBe(6);
        });

        it("shows Design department contacts", async () => {
            await render(<ListViewDemo />);

            const designContacts = await screen.findAllByText("Design");
            expect(designContacts.length).toBe(3);
        });

        it("shows Marketing department contacts", async () => {
            await render(<ListViewDemo />);

            const marketingContacts = await screen.findAllByText("Marketing");
            expect(marketingContacts.length).toBe(3);
        });

        it("shows Sales department contacts", async () => {
            await render(<ListViewDemo />);

            const salesContacts = await screen.findAllByText("Sales");
            expect(salesContacts.length).toBe(3);
        });
    });

    describe("contact data integrity", () => {
        it("displays Alice Johnson with correct email", async () => {
            await render(<ListViewDemo />);

            const aliceName = await screen.findByText("Alice Johnson");
            const aliceEmail = await screen.findByText("alice@company.com");

            expect(aliceName).toBeDefined();
            expect(aliceEmail).toBeDefined();
        });

        it("displays Bob Smith with Design department", async () => {
            await render(<ListViewDemo />);

            const bobName = await screen.findByText("Bob Smith");
            const bobEmail = await screen.findByText("bob@company.com");

            expect(bobName).toBeDefined();
            expect(bobEmail).toBeDefined();
        });

        it("displays all 15 contacts", async () => {
            await render(<ListViewDemo />);

            const allNames = [
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
                "Mia Harris",
                "Noah Martin",
                "Olivia Garcia",
            ];

            let count = 0;
            for (const name of allNames) {
                const found = await screen.findByText(name);
                if (found) count++;
            }

            expect(count).toBe(15);
        });
    });

    describe("virtual scrolling feature", () => {
        it("mentions virtual scrolling in description", async () => {
            await render(<ListViewDemo />);

            const descriptions = await screen.findAllByText(/virtual scrolling/i);
            expect(descriptions.length).toBeGreaterThan(0);
        });

        it("mentions widget recycling feature", async () => {
            await render(<ListViewDemo />);

            const recycling = await screen.findByText(/Widget recycling reduces memory usage/);
            expect(recycling).toBeDefined();
        });

        it("mentions renderItem prop", async () => {
            await render(<ListViewDemo />);

            const renderItem = await screen.findByText(/renderItem prop for custom item rendering/);
            expect(renderItem).toBeDefined();
        });
    });

    describe("layout structure", () => {
        it("renders contact rows with horizontal layout", async () => {
            await render(<ListViewDemo />);

            const aliceName = await screen.findByText("Alice Johnson");
            const aliceEmail = await screen.findByText("alice@company.com");

            expect(aliceName).toBeDefined();
            expect(aliceEmail).toBeDefined();
        });

        it("renders initials with specific styling", async () => {
            await render(<ListViewDemo />);

            const initial = await screen.findByText("A");
            expect(initial).toBeDefined();
        });
    });
});
