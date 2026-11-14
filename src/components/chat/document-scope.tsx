"use client";

import { ChatDocumentView } from "@/lib/chat";
import { ChevronDownIcon, LayersIcon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { InputGroupButton } from "../ui/input-group";

function scopeLabel(documents: ChatDocumentView[], selected: string[]) {
    if (selected.length === documents.length) {
        return `All ${documents.length} ${documents.length === 1 ? "Document" : "Documents"}`;
    }

    if (selected.length === 1) {
        const only = documents.find((document) => document.id === selected[0]);
        return only?.name ?? "1 Document";
    }

    return `${selected.length} of ${documents.length} Documents`;
}

function DocumentScope({
    documents,
    selected,
    onChange,
    disabled = false,
}: {
    documents: ChatDocumentView[];
    selected: string[];
    onChange: (selected: string[]) => void;
    disabled?: boolean;
}) {
    if (documents.length <= 1) {
        return (
            <span className="flex items-center gap-1.5 rounded-lg border bg-surface px-2 py-1 text-xs text-muted-foreground">
                <LayersIcon className="size-3.5" />
                {documents.length === 1 ? "1 Document" : "No Documents"}
            </span>
        );
    }

    function toggle(id: string) {
        if (selected.includes(id)) {
            if (selected.length === 1) return;

            onChange(selected.filter((selectedId) => selectedId !== id));
            return;
        }

        onChange(
            documents
                .map((document) => document.id)
                .filter((id2) => selected.includes(id2) || id2 === id),
        );
    }

    const isEverything = selected.length === documents.length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <InputGroupButton
                        variant="outline"
                        className="cursor-pointer"
                        disabled={disabled}
                        aria-label="Choose which documents to search"
                    />
                }
            >
                <LayersIcon />
                <span className="max-w-40 truncate">
                    {scopeLabel(documents, selected)}
                </span>
                <ChevronDownIcon />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-72">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Answer From</DropdownMenuLabel>

                    {documents.map((document) => {
                        const isChecked = selected.includes(document.id);

                        return (
                            <DropdownMenuCheckboxItem
                                key={document.id}
                                checked={isChecked}
                                closeOnClick={false}
                                disabled={isChecked && selected.length === 1}
                                onCheckedChange={() => toggle(document.id)}
                                className="cursor-pointer"
                            >
                                <span className="truncate">
                                    {document.name}
                                </span>
                            </DropdownMenuCheckboxItem>
                        );
                    })}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem
                        disabled={isEverything}
                        onClick={() =>
                            onChange(documents.map((document) => document.id))
                        }
                        className="cursor-pointer"
                    >
                        Select All Documents
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export { DocumentScope };
