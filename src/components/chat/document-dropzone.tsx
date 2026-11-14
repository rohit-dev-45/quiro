"use client";

import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { Spinner } from "../ui/spinner";
import { UploadIcon } from "lucide-react";
import { DOCUMENT_ACCEPT, DOCUMENT_FORMATS_LABEL } from "@/lib/chat";

function DocumentDropzone({
    onFiles,
    busy,
    className,
}: {
    onFiles: (files: File[]) => void;
    busy?: string | null;
    className?: string;
}) {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const isBusy = Boolean(busy);

    return (
        <>
            <button
                type="button"
                disabled={isBusy}
                onClick={() => inputRef.current?.click()}
                onDragOver={(event) => {
                    event.preventDefault();
                    if (!isBusy) setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                    if (!isBusy) onFiles(Array.from(event.dataTransfer.files));
                }}
                className={cn(
                    "flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed bg-surface px-6 py-10 text-center transition-colors hover:border-brand disabled:cursor-not-allowed disabled:opacity-70",
                    isDragging && "border-brand bg-accent/40",
                    className,
                )}
            >
                {isBusy ? (
                    <>
                        <Spinner className="size-5 text-muted-foreground" />
                        <span className="font-semibold">{busy}</span>
                        <span className="text-sm text-muted-foreground">
                            Large Briefs Take a Few Seconds To Read.
                        </span>
                    </>
                ) : (
                    <>
                        <UploadIcon className="size-5 text-muted-foreground" />
                        <span className="font-semibold">
                            Drop Files Here Or Click To Upload
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {DOCUMENT_FORMATS_LABEL}
                        </span>
                    </>
                )}
            </button>

            <input
                ref={inputRef}
                type="file"
                multiple
                accept={DOCUMENT_ACCEPT}
                className="sr-only"
                onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    event.target.value = "";
                    onFiles(files);
                }}
            />
        </>
    );
}

export { DocumentDropzone };
