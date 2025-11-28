import * as Gtk from "@gtkx/ffi/gtk";
import { Box, Label } from "@gtkx/gtkx";
import type { Demo } from "../types.js";

export const GlShadersOverviewDemo = () => {
    return (
        <Box orientation={Gtk.Orientation.VERTICAL} spacing={20} marginStart={20} marginEnd={20} marginTop={20}>
            <Label.Root label="GL & Shaders" cssClasses={["title-2"]} halign={Gtk.Align.START} />

            <Box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                <Label.Root label="About GL Rendering" cssClasses={["heading"]} halign={Gtk.Align.START} />
                <Label.Root
                    label="GTK4 uses OpenGL for hardware-accelerated rendering. Custom shaders can be used for advanced visual effects."
                    wrap
                    cssClasses={["dim-label"]}
                />
            </Box>

            <Box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                <Label.Root label="Shader Types" cssClasses={["heading"]} halign={Gtk.Align.START} />
                <Label.Root
                    label="• GskGLShader - Custom GLSL fragment shaders\n• GtkGLArea - OpenGL rendering widget\n• GskShaderNode - Shader-based render nodes"
                    wrap
                    cssClasses={["dim-label"]}
                />
            </Box>

            <Box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                <Label.Root label="Status" cssClasses={["heading"]} halign={Gtk.Align.START} />
                <Label.Root
                    label="OpenGL and shader support requires direct GL context access which is planned for future GTKX releases."
                    wrap
                    cssClasses={["dim-label"]}
                />
            </Box>
        </Box>
    );
};

export const glShadersOverviewDemo: Demo = {
    id: "gl-shaders-overview",
    title: "GL & Shaders Overview",
    description: "Hardware-accelerated rendering with OpenGL shaders.",
    keywords: ["opengl", "gl", "shaders", "glsl", "gpu"],
    component: GlShadersOverviewDemo,
    source: `// OpenGL and shader support coming in future releases`,
};
