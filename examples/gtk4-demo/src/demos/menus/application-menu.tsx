import * as Gtk from "@gtkx/ffi/gtk";
import { ApplicationMenu, Box, Label, Menu, quit } from "@gtkx/react";
import { useState } from "react";
import { getSourcePath } from "../source-path.js";
import type { Demo } from "../types.js";

const ApplicationMenuDemo = () => {
    const [lastAction, setLastAction] = useState<string | null>(null);

    const handleAction = (action: string) => {
        setLastAction(action);
    };

    return (
        <>
            <ApplicationMenu>
                <Menu.Submenu label="Demo File">
                    <Menu.Item
                        label="New Document"
                        onActivate={() => handleAction("New Document")}
                        accels="<Control>n"
                    />
                    <Menu.Item label="Open..." onActivate={() => handleAction("Open")} accels="<Control>o" />
                    <Menu.Item label="Save" onActivate={() => handleAction("Save")} accels="<Control>s" />
                    <Menu.Section>
                        <Menu.Item label="Quit Demo" onActivate={quit} accels="<Control>q" />
                    </Menu.Section>
                </Menu.Submenu>
                <Menu.Submenu label="Demo Edit">
                    <Menu.Item label="Undo" onActivate={() => handleAction("Undo")} accels="<Control>z" />
                    <Menu.Item label="Redo" onActivate={() => handleAction("Redo")} accels="<Control><Shift>z" />
                    <Menu.Section>
                        <Menu.Item label="Cut" onActivate={() => handleAction("Cut")} accels="<Control>x" />
                        <Menu.Item label="Copy" onActivate={() => handleAction("Copy")} accels="<Control>c" />
                        <Menu.Item label="Paste" onActivate={() => handleAction("Paste")} accels="<Control>v" />
                    </Menu.Section>
                </Menu.Submenu>
                <Menu.Submenu label="Demo Help">
                    <Menu.Item label="Documentation" onActivate={() => handleAction("Documentation")} accels="F1" />
                    <Menu.Item label="About" onActivate={() => handleAction("About")} />
                </Menu.Submenu>
            </ApplicationMenu>
            <Box orientation={Gtk.Orientation.VERTICAL} spacing={20} marginStart={20} marginEnd={20} marginTop={20}>
                <Label.Root label="Application Menu" cssClasses={["title-2"]} halign={Gtk.Align.START} />

                <Box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                    <Label.Root label="About ApplicationMenu" cssClasses={["heading"]} halign={Gtk.Align.START} />
                    <Label.Root
                        label="ApplicationMenu creates a traditional menu bar at the top of your application window. Navigate to this demo to see the menu bar appear, and navigate away to see it disappear!"
                        wrap
                        cssClasses={["dim-label"]}
                    />
                </Box>

                <Box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                    <Label.Root label="Last Action" cssClasses={["heading"]} halign={Gtk.Align.START} />
                    <Label.Root
                        label={lastAction ?? "(Click a menu item or use a keyboard shortcut)"}
                        cssClasses={lastAction ? ["accent"] : ["dim-label"]}
                    />
                </Box>

                <Box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                    <Label.Root label="Try It" cssClasses={["heading"]} halign={Gtk.Align.START} />
                    <Label.Root
                        label="Look at the menu bar above - you should see 'Demo File', 'Demo Edit', and 'Demo Help' menus. Click on them or use the keyboard shortcuts (shown in the menu items). When you navigate to another demo, this menu will be removed."
                        wrap
                        cssClasses={["dim-label"]}
                    />
                </Box>

                <Box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                    <Label.Root label="Code Structure" cssClasses={["heading"]} halign={Gtk.Align.START} />
                    <Label.Root
                        label={`<ApplicationMenu>
  <Menu.Submenu label="File">
    <Menu.Item label="New" onActivate={...} accels="<Control>n" />
    <Menu.Item label="Quit" onActivate={quit} accels="<Control>q" />
  </Menu.Submenu>
</ApplicationMenu>`}
                        wrap={false}
                        cssClasses={["monospace"]}
                    />
                </Box>
            </Box>
        </>
    );
};

export const applicationMenuDemo: Demo = {
    id: "applicationmenu",
    title: "Application Menu",
    description: "Traditional menu bar for desktop applications using ApplicationMenu and Menu components.",
    keywords: ["menu", "menubar", "application", "GtkApplication", "declarative"],
    component: ApplicationMenuDemo,
    sourcePath: getSourcePath(import.meta.url, "application-menu.tsx"),
};
