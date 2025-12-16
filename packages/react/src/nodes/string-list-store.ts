import * as Gtk from "@gtkx/ffi/gtk";

export class StringListStore {
    private stringList: Gtk.StringList;
    private ids: string[] = [];

    constructor() {
        this.stringList = new Gtk.StringList([]);
    }

    getModel(): Gtk.StringList {
        return this.stringList;
    }

    append(id: string, label: string): void {
        this.stringList.append(label);
        this.ids.push(id);
    }

    insertBefore(id: string, label: string, beforeId: string): void {
        const beforeIndex = this.ids.indexOf(beforeId);

        if (beforeIndex === -1) {
            this.append(id, label);
            return;
        }

        this.stringList.splice(beforeIndex, 0, [label]);
        this.ids.splice(beforeIndex, 0, id);
    }

    remove(id: string): void {
        const index = this.ids.indexOf(id);

        if (index !== -1) {
            this.stringList.remove(index);
            this.ids.splice(index, 1);
        }
    }

    update(oldId: string, newId: string, newLabel: string): void {
        const index = this.ids.indexOf(oldId);

        if (index !== -1) {
            this.stringList.splice(index, 1, [newLabel]);
            this.ids[index] = newId;
        }
    }

    getIdAtIndex(index: number): string | undefined {
        return this.ids[index];
    }

    getIndexForId(id: string): number {
        return this.ids.indexOf(id);
    }
}
