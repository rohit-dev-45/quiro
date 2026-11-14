"use client";

import { LibraryDocumentView } from "@/lib/chat";
import { useState } from "react";
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandShortcut,
} from "../ui/command";
import { Kbd } from "../ui/kbd";
import { Checkbox } from "../ui/checkbox";
import { FileTextIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

function LibraryPickerDialog({
    open,
    onOpenChange,
    onAdd,
    documents = [],
    addedIds = [],
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (documents: LibraryDocumentView[]) => void;
    documents?: LibraryDocumentView[];
    addedIds?: string[];
}) {
    const [selected, setSelected] = useState<string[]>([]);

    function close() {
        setSelected([]);
        onOpenChange(false);
    }

    function toggle(id: string) {
        setSelected((current) =>
            current.includes(id)
                ? current.filter((selectedId) => selectedId !== id)
                : [...current, id],
        );
    }

    function add() {
        onAdd(documents.filter((document) => selected.includes(document.id)));
        close();
    }

    return (
        <CommandDialog
            open={open}
            onOpenChange={(next) => (next ? onOpenChange(true) : close())}
            title="Choose from Library"
            description="Search Your Library And Add Documents To This Chat."
            className="top-28 sm:max-w-xl"
        >
            <Command className="gap-0 p-0 **:data-[slot=command-input-wrapper]:border-b **:data-[slot=command-input-wrapper]:p-0 **:data-[slot=input-group]:h-14! **:data-[slot=input-group]:rounded-none! **:data-[slot=input-group]:border-0 **:data-[slot=input-group]:bg-transparent **:data-[slot=input-group]:px-3">
                <div className="relative">
                    <CommandInput placeholder="Search Your Library…" />
                    <Kbd className="absolute top-1/2 right-4 -translate-y-1/2 border bg-background">
                        ESC
                    </Kbd>
                </div>

                <CommandList className="max-h-96">
                    <CommandEmpty>No Documents Match That Search.</CommandEmpty>

                    {documents.length === 0 ? (
                        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                            Your Library Is Empty. Upload a Document And It Will
                            Show Up Here For Every Chat After This One.
                        </p>
                    ) : (
                        <CommandGroup
                            heading={`Library · ${documents.length} ${documents.length === 1 ? "Document" : "Documents"}`}
                            className="p-0 **:[[cmdk-group-heading]]:px-4 **:[[cmdk-group-heading]]:pt-4 **:[[cmdk-group-heading]]:pb-2 **:[[cmdk-group-heading]]:text-[0.6875rem] **:[[cmdk-group-heading]]:font-bold **:[[cmdk-group-heading]]:tracking-[0.08em] **:[[cmdk-group-heading]]:uppercase"
                        >
                            {documents.map((document) => {
                                const added = addedIds.includes(document.id);
                                const unusable = document.status !== "READY";
                                const status = unusable
                                    ? document.status === "PROCESSING"
                                        ? "indexing…"
                                        : "unreadable"
                                    : added
                                      ? "added"
                                      : null;

                                return (
                                    <CommandItem
                                        key={document.id}
                                        value={`${document.name} ${document.format}`}
                                        disabled={unusable || added}
                                        onSelect={() => toggle(document.id)}
                                        className="cursor-pointer gap-3 rounded-none! px-4 py-3"
                                    >
                                        <Checkbox
                                            checked={
                                                added ||
                                                selected.includes(document.id)
                                            }
                                            className="pointer-events-none"
                                        />

                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-surface text-muted-foreground">
                                            <FileTextIcon />
                                        </span>

                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate font-semibold">
                                                {document.name}
                                            </span>
                                            <span className="block truncate text-xs text-muted-foreground">
                                                {document.meta}
                                            </span>
                                        </span>

                                        <CommandShortcut className="flex items-center gap-2 tracking-normal">
                                            <Badge
                                                variant="outline"
                                                className="rounded-md font-mono text-[0.625rem] tracking-wider"
                                            >
                                                {document.format}
                                            </Badge>
                                            {status && (
                                                <span className="text-xs">
                                                    {status}
                                                </span>
                                            )}
                                        </CommandShortcut>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    )}
                </CommandList>

                <div className="flex items-center gap-3 border-t px-4 py-3">
                    <span className="font-mono text-sm text-muted-foreground">
                        {selected.length} Selected
                    </span>

                    <Button
                        variant="outline"
                        size="lg"
                        className="ml-auto cursor-pointer"
                        onClick={close}
                    >
                        Cancel
                    </Button>

                    <Button
                        size="lg"
                        className="cursor-pointer"
                        disabled={selected.length === 0}
                        onClick={add}
                    >
                        Add {selected.length}{" "}
                        {selected.length === 1 ? "Source" : "Sources"}
                    </Button>
                </div>
            </Command>
        </CommandDialog>
    );
}

export { LibraryPickerDialog };
