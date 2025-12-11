import { AccessibleRole } from "@gtkx/ffi/gtk";
import { cleanup, render, screen, userEvent, waitFor } from "@gtkx/testing";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "../src/app.js";

describe("GL Shaders Demos", () => {
    afterEach(async () => {
        await cleanup();
    });

    it("navigates to GLArea demo", async () => {
        await render(<App />, { wrapper: false });

        const glShadersExpander = await screen.findByRole(AccessibleRole.BUTTON, { name: "GL & Shaders" });
        await userEvent.activate(glShadersExpander);

        const glAreaButton = await screen.findByRole(AccessibleRole.BUTTON, { name: /OpenGL Area/ });
        await userEvent.click(glAreaButton);

        await waitFor(async () => {
            await screen.findByText("Rotation Controls");
        });

        const sliders = await screen.findAllByRole(AccessibleRole.SLIDER);
        expect(sliders).toHaveLength(3);
    });

    it("navigates back and forth between demos", async () => {
        await render(<App />, { wrapper: false });

        const glShadersExpander = await screen.findByRole(AccessibleRole.BUTTON, { name: "GL & Shaders" });
        await userEvent.activate(glShadersExpander);

        for (let i = 0; i < 50; i++) {
            const glAreaButton = await screen.findByRole(AccessibleRole.BUTTON, { name: /OpenGL Area/ });
            await userEvent.click(glAreaButton);

            await waitFor(async () => {
                await screen.findByText("Rotation Controls");
            });

            const overviewButton = await screen.findByRole(AccessibleRole.BUTTON, { name: /GL & Shaders Overview/ });
            await userEvent.click(overviewButton);

            await waitFor(async () => {
                await screen.findByText(/GTK4 uses OpenGL/);
            });
        }
    }, 120000);
});
