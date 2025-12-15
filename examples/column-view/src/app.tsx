import { Orientation, SortType } from "@gtkx/ffi/gtk";
import { ApplicationWindow, Box, ColumnView, HeaderBar, Label, quit, ScrolledWindow } from "@gtkx/react";
import { useCallback, useState } from "react";
import type { ColumnId, Contact } from "./types.js";

const initialContacts: Contact[] = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", phone: "555-0101" },
    { id: 2, name: "Bob Smith", email: "bob@example.com", phone: "555-0102" },
    { id: 3, name: "Carol White", email: "carol@example.com", phone: "555-0103" },
    { id: 4, name: "David Brown", email: "david@example.com", phone: "555-0104" },
    { id: 5, name: "Eve Davis", email: "eve@example.com", phone: "555-0105" },
];

export const App = () => {
    const [sortColumn, setSortColumn] = useState<ColumnId | null>("name");
    const [sortOrder, setSortOrder] = useState<SortType>(SortType.ASCENDING);

    const handleSortChange = useCallback((column: ColumnId | null, order: SortType) => {
        setSortColumn(column);
        setSortOrder(order);
    }, []);

    const sortFn = useCallback((a: Contact, b: Contact, columnId: ColumnId): number => {
        const aValue = a[columnId];
        const bValue = b[columnId];
        return aValue.localeCompare(bValue);
    }, []);

    const renderName = (item: Contact | null) => <Label label={item?.name ?? ""} halign={1} />;

    const renderEmail = (item: Contact | null) => <Label label={item?.email ?? ""} halign={1} />;

    const renderPhone = (item: Contact | null) => <Label label={item?.phone ?? ""} halign={1} />;

    return (
        <ApplicationWindow title="Contacts" defaultWidth={600} defaultHeight={400} onCloseRequest={quit}>
            <HeaderBar.Root>
                <HeaderBar.TitleWidget>
                    <Label label="Contacts" cssClasses={["title"]} />
                </HeaderBar.TitleWidget>
            </HeaderBar.Root>

            <Box
                orientation={Orientation.VERTICAL}
                spacing={0}
                marginTop={12}
                marginBottom={12}
                marginStart={12}
                marginEnd={12}
                vexpand
            >
                <ScrolledWindow vexpand hexpand>
                    <ColumnView.Root<Contact, ColumnId>
                        sortColumn={sortColumn}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                        sortFn={sortFn}
                        showColumnSeparators
                        showRowSeparators
                    >
                        <ColumnView.Column<Contact> id="name" title="Name" expand renderCell={renderName} />
                        <ColumnView.Column<Contact> id="email" title="Email" expand renderCell={renderEmail} />
                        <ColumnView.Column<Contact> id="phone" title="Phone" renderCell={renderPhone} />

                        {initialContacts.map((contact) => (
                            <ColumnView.Item key={contact.id} item={contact} />
                        ))}
                    </ColumnView.Root>
                </ScrolledWindow>
            </Box>
        </ApplicationWindow>
    );
};

export default App;

export const appId = "com.gtkx.column-view";
