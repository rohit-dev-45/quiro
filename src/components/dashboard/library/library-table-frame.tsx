import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const headCell =
    "h-11 px-6 text-[0.6875rem] font-bold tracking-[0.08em] text-muted-foreground uppercase";

const columns = [
    { label: "Name", className: "w-full" },
    { label: "Type", className: "w-32" },
    { label: "Status", className: "w-40" },
    { label: "Added", className: "w-32" },
];

function LibraryTableFrame({
    children,
    footer,
}: {
    children: ReactNode;
    footer: ReactNode;
}) {
    return (
        <div className="mt-5 overflow-hidden rounded-xl border bg-card">
            <Table className="min-w-184 table-fixed">
                <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                        {columns.map((column) => (
                            <TableHead
                                key={column.label}
                                className={cn(headCell, column.className)}
                            >
                                {column.label}
                            </TableHead>
                        ))}

                        <TableHead className="w-16 px-6">
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>

                {children}
            </Table>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t px-6 py-4">
                {footer}
            </div>
        </div>
    );
}

export { LibraryTableFrame };
