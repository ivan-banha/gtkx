import { cleanup, render, screen } from "@gtkx/testing";
import { afterEach, describe, expect, it } from "vitest";
import { GridViewDemo } from "../src/demos/grid-view.js";

describe("GridViewDemo", () => {
    afterEach(async () => {
        await cleanup();
    });

    describe("rendering", () => {
        it("renders the title", async () => {
            await render(<GridViewDemo />);

            const title = await screen.findByText("GridView");
            expect(title).toBeDefined();
        });

        it("renders the description", async () => {
            await render(<GridViewDemo />);

            const description = await screen.findByText(
                /GtkGridView displays items in a grid layout with virtual scrolling/,
            );
            expect(description).toBeDefined();
        });

        it("renders the photo gallery heading", async () => {
            await render(<GridViewDemo />);

            const heading = await screen.findByText("Photo Gallery");
            expect(heading).toBeDefined();
        });

        it("renders key features section", async () => {
            await render(<GridViewDemo />);

            const keyFeatures = await screen.findByText("Key Features");
            expect(keyFeatures).toBeDefined();
        });

        it("shows photo count", async () => {
            await render(<GridViewDemo />);

            const photoCount = await screen.findByText("16 photos");
            expect(photoCount).toBeDefined();
        });
    });

    describe("photo titles", () => {
        it("renders all photo titles", async () => {
            await render(<GridViewDemo />);

            const photoTitles = [
                "Sunset Beach",
                "Mountain Peak",
                "City Lights",
                "Forest Path",
                "Ocean Waves",
                "Desert Dunes",
                "Northern Lights",
                "Autumn Leaves",
                "Snow Peaks",
                "Rainforest",
                "Starry Night",
                "Coral Reef",
                "Lavender Field",
                "Cherry Blossom",
                "Golden Hour",
                "Misty Morning",
            ];

            for (const title of photoTitles) {
                const titleLabel = await screen.findByText(title);
                expect(titleLabel).toBeDefined();
            }
        });

        it("displays photo count matching expected amount", async () => {
            await render(<GridViewDemo />);

            const photoTitles = [
                "Sunset Beach",
                "Mountain Peak",
                "City Lights",
                "Forest Path",
                "Ocean Waves",
                "Desert Dunes",
                "Northern Lights",
                "Autumn Leaves",
                "Snow Peaks",
                "Rainforest",
                "Starry Night",
                "Coral Reef",
                "Lavender Field",
                "Cherry Blossom",
                "Golden Hour",
                "Misty Morning",
            ];

            let count = 0;
            for (const title of photoTitles) {
                const found = await screen.findByText(title);
                if (found) count++;
            }

            expect(count).toBe(16);
        });
    });

    describe("photo sizes", () => {
        it("renders photo file sizes", async () => {
            await render(<GridViewDemo />);

            const sizes = [
                "2.4 MB",
                "3.1 MB",
                "1.8 MB",
                "2.9 MB",
                "2.2 MB",
                "3.5 MB",
                "4.1 MB",
                "2.7 MB",
                "3.3 MB",
                "2.8 MB",
                "3.9 MB",
                "2.5 MB",
                "2.1 MB",
                "1.9 MB",
                "3.0 MB",
                "2.6 MB",
            ];

            for (const size of sizes) {
                const sizeLabel = await screen.findByText(size);
                expect(sizeLabel).toBeDefined();
            }
        });

        it("shows largest file size (4.1 MB for Northern Lights)", async () => {
            await render(<GridViewDemo />);

            const largestSize = await screen.findByText("4.1 MB");
            expect(largestSize).toBeDefined();
        });

        it("shows smallest file size (1.8 MB for City Lights)", async () => {
            await render(<GridViewDemo />);

            const smallestSize = await screen.findByText("1.8 MB");
            expect(smallestSize).toBeDefined();
        });
    });

    describe("feature documentation", () => {
        it("mentions automatic grid layout", async () => {
            await render(<GridViewDemo />);

            const gridLayout = await screen.findByText(/Automatic grid layout with configurable columns/);
            expect(gridLayout).toBeDefined();
        });

        it("mentions virtual scrolling", async () => {
            await render(<GridViewDemo />);

            const virtualScrolling = await screen.findByText(/Virtual scrolling for large datasets/);
            expect(virtualScrolling).toBeDefined();
        });

        it("mentions minColumns and maxColumns", async () => {
            await render(<GridViewDemo />);

            const columns = await screen.findByText(/minColumns and maxColumns for responsive design/);
            expect(columns).toBeDefined();
        });

        it("mentions renderItem pattern", async () => {
            await render(<GridViewDemo />);

            const renderItem = await screen.findByText(/Same renderItem pattern as ListView/);
            expect(renderItem).toBeDefined();
        });
    });

    describe("photo data integrity", () => {
        it("displays Sunset Beach photo data", async () => {
            await render(<GridViewDemo />);

            const title = await screen.findByText("Sunset Beach");
            const size = await screen.findByText("2.4 MB");

            expect(title).toBeDefined();
            expect(size).toBeDefined();
        });

        it("displays Mountain Peak photo data", async () => {
            await render(<GridViewDemo />);

            const title = await screen.findByText("Mountain Peak");
            const size = await screen.findByText("3.1 MB");

            expect(title).toBeDefined();
            expect(size).toBeDefined();
        });

        it("displays Northern Lights photo data", async () => {
            await render(<GridViewDemo />);

            const title = await screen.findByText("Northern Lights");
            const size = await screen.findByText("4.1 MB");

            expect(title).toBeDefined();
            expect(size).toBeDefined();
        });

        it("displays Cherry Blossom photo data", async () => {
            await render(<GridViewDemo />);

            const title = await screen.findByText("Cherry Blossom");
            const size = await screen.findByText("1.9 MB");

            expect(title).toBeDefined();
            expect(size).toBeDefined();
        });
    });

    describe("use case description", () => {
        it("mentions photo galleries use case", async () => {
            await render(<GridViewDemo />);

            const useCase = await screen.findByText(/Perfect for photo galleries, file browsers, and icon views/);
            expect(useCase).toBeDefined();
        });
    });

    describe("photo categories by color theme", () => {
        it("renders nature-themed photos", async () => {
            await render(<GridViewDemo />);

            const naturePhotos = [
                "Sunset Beach",
                "Mountain Peak",
                "Forest Path",
                "Ocean Waves",
                "Desert Dunes",
                "Snow Peaks",
                "Rainforest",
            ];

            for (const photo of naturePhotos) {
                const found = await screen.findByText(photo);
                expect(found).toBeDefined();
            }
        });

        it("renders sky-themed photos", async () => {
            await render(<GridViewDemo />);

            const skyPhotos = ["Northern Lights", "Starry Night", "Golden Hour", "Misty Morning"];

            for (const photo of skyPhotos) {
                const found = await screen.findByText(photo);
                expect(found).toBeDefined();
            }
        });

        it("renders flora-themed photos", async () => {
            await render(<GridViewDemo />);

            const floraPhotos = ["Autumn Leaves", "Lavender Field", "Cherry Blossom", "Coral Reef"];

            for (const photo of floraPhotos) {
                const found = await screen.findByText(photo);
                expect(found).toBeDefined();
            }
        });
    });
});
