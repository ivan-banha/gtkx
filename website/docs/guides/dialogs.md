---
sidebar_position: 3
---

# Working with Dialogs

This guide covers how to display dialogs and modal windows in GTKX applications.

## Dialog Types

GTKX supports several dialog types through special node handling:

| Dialog | Purpose |
|--------|---------|
| `FileDialog` | File selection (open/save) |
| `AlertDialog` | Alerts and confirmations |
| `AboutDialog` | Application information |
| `ColorDialog` | Color selection |
| `FontDialog` | Font selection |

## FileDialog

FileDialog supports different modes for various file operations:

| Mode | Description |
|------|-------------|
| `"open"` | Select a single file to open (default) |
| `"openMultiple"` | Select multiple files |
| `"save"` | Choose location to save a file |
| `"selectFolder"` | Select a directory |

### Opening a File

```tsx
const [showOpen, setShowOpen] = useState(false);

<Button label="Open File" onClicked={() => setShowOpen(true)} />

{showOpen && (
  <FileDialog
    mode="open"
    title="Select a file"
    onCloseRequest={() => {
      setShowOpen(false);
      return false;
    }}
  />
)}
```

### Saving a File

```tsx
const [showSave, setShowSave] = useState(false);

<Button label="Save As..." onClicked={() => setShowSave(true)} />

{showSave && (
  <FileDialog
    mode="save"
    title="Save file as"
    onCloseRequest={() => {
      setShowSave(false);
      return false;
    }}
  />
)}
```

### Selecting a Folder

```tsx
{showFolder && (
  <FileDialog
    mode="selectFolder"
    title="Choose a directory"
    onCloseRequest={() => {
      setShowFolder(false);
      return false;
    }}
  />
)}
```

## AlertDialog

Display alerts and confirmation dialogs:

```tsx
const [showAlert, setShowAlert] = useState(false);

<Button label="Delete" onClicked={() => setShowAlert(true)} />

{showAlert && (
  <AlertDialog
    message="Confirm Delete"
    detail="Are you sure you want to delete this item?"
    onCloseRequest={() => {
      setShowAlert(false);
      return false;
    }}
  />
)}
```

## AboutDialog

Display information about your application:

```tsx
const [showAbout, setShowAbout] = useState(false);

<Button label="About" onClicked={() => setShowAbout(true)} />

{showAbout && (
  <AboutDialog
    programName="My Application"
    version="1.0.0"
    comments="Built with GTKX"
    copyright="Copyright 2024"
    authors={["Developer Name"]}
    website="https://example.com"
    onCloseRequest={() => {
      setShowAbout(false);
      return false;
    }}
  />
)}
```

## Dialog Buttons (ColorDialogButton, FontDialogButton)

Some dialogs have built-in button widgets that handle showing the dialog:

```tsx
<Box spacing={10}>
  <Label.Root label="Pick a color:" />
  <ColorDialogButton />
</Box>

<Box spacing={10}>
  <Label.Root label="Pick a font:" />
  <FontDialogButton />
</Box>
```

## Popover (Lightweight Dialog)

For lightweight modal content attached to a widget:

```tsx
<Popover.Root autohide>
  <Popover.Child>
    <Box spacing={10} marginTop={10} marginBottom={10} marginStart={10} marginEnd={10}>
      <Label.Root label="Popover Content" />
      <Button label="Action" onClicked={() => {}} />
    </Box>
  </Popover.Child>
  <Button label="Open Popover" />
</Popover.Root>
```

## Dialog State Management

### Single Dialog

```tsx
const [showDialog, setShowDialog] = useState(false);

<Button label="Show" onClicked={() => setShowDialog(true)} />

{showDialog && (
  <MyDialog onClose={() => setShowDialog(false)} />
)}
```

### Multiple Dialogs

For applications with multiple dialog types:

```tsx
type DialogType = "about" | "settings" | "confirm" | null;

const [activeDialog, setActiveDialog] = useState<DialogType>(null);

const openDialog = (type: DialogType) => setActiveDialog(type);
const closeDialog = () => setActiveDialog(null);

{activeDialog === "about" && (
  <AboutDialog onCloseRequest={() => { closeDialog(); return false; }} />
)}

{activeDialog === "settings" && (
  <SettingsDialog onClose={closeDialog} />
)}
```

## Best Practices

### Always Handle Close

Provide a way to close dialogs:

```tsx
<FileDialog
  onCloseRequest={() => {
    setShowDialog(false);
    return false; // Allow closing
  }}
/>
```

### Use Conditional Rendering

Mount dialogs only when needed:

```tsx
// Preferred - only mounts when needed
{showDialog && <MyDialog />}
```

### Focus Management

GTK handles focus management automatically for dialog types. When a dialog opens, it receives focus; when it closes, focus returns to the previous widget.
