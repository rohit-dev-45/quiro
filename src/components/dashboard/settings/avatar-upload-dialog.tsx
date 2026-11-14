"use client";

import { SpinnerRing } from "@/components/common/spinner-ring";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AVATAR_MAX_BYTES,
    AVATAR_MAX_DIMENSION,
    AVATAR_MIME_TYPES,
} from "@/lib/avatar";
import { cn } from "@/lib/utils";
import { ImageUpIcon } from "lucide-react";
import { ReactElement, useRef, useState } from "react";

const ACCEPT = AVATAR_MIME_TYPES.join(",");

async function toAvatarFile(file: File) {
    if (typeof createImageBitmap !== "function") return file;

    try {
        const bitmap = await createImageBitmap(file);
        const side = Math.min(
            bitmap.width,
            bitmap.height,
            AVATAR_MAX_DIMENSION,
        );

        const canvas = document.createElement("canvas");
        canvas.width = side;
        canvas.height = side;

        const context = canvas.getContext("2d");
        if (!context) return file;

        const scale = side / Math.min(bitmap.width, bitmap.height);
        const width = bitmap.width * scale;
        const height = bitmap.height * scale;
        context.drawImage(
            bitmap,
            (side - width) / 2,
            (side - height) / 2,
            width,
            height,
        );
        bitmap.close();

        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/webp", 0.9),
        );

        if (!blob) return file;

        return new File([blob], "avatar.webp", { type: "image/webp" });
    } catch {
        return file;
    }
}

function AvatarUploadDialog({
    onUploaded,
    children,
}: {
    onUploaded: () => Promise<void> | void;
    children: ReactElement;
}) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<{
        file: File;
        preview: string;
    } | null>(null);
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    function clearSelection() {
        if (selected) URL.revokeObjectURL(selected.preview);
        setSelected(null);
    }

    function handleOpenChange(next: boolean) {
        setOpen(next);

        if (!next) {
            clearSelection();
            setError(null);
            setDragging(false);
        }
    }

    function accept(candidate: File | undefined) {
        setError(null);

        if (!candidate) return;

        if (!AVATAR_MIME_TYPES.includes(candidate.type)) {
            setError("Use a PNG, JPEG, Or WebP Image.");
            return;
        }

        if (candidate.size > AVATAR_MAX_BYTES * 4) {
            setError("That Image Is Too Large.");
            return;
        }

        if (selected) URL.revokeObjectURL(selected.preview);
        setSelected({
            file: candidate,
            preview: URL.createObjectURL(candidate),
        });
    }

    async function handleSave() {
        if (!selected) return;

        setUploading(true);
        setError(null);

        const body = new FormData();
        body.append("file", await toAvatarFile(selected.file));

        const response = await fetch("/api/avatar", { method: "POST", body });

        if (!response.ok) {
            const { error: message } = await response
                .json()
                .catch(() => ({ error: null }));

            setUploading(false);
            setError(
                message ?? "Couldn't Upload That Image. Please Try Again.",
            );
            return;
        }

        await onUploaded();
        setUploading(false);
        handleOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger render={children} />

            <DialogContent className="sm:max-w-110">
                <DialogHeader>
                    <DialogTitle>Upload a Profile Picture</DialogTitle>
                    <DialogDescription>
                        PNG, JPEG, Or WebP. It&apos;s Cropped To a Square And
                        Scaled To {AVATAR_MAX_DIMENSION}px.
                    </DialogDescription>
                </DialogHeader>

                <div
                    role="button"
                    tabIndex={0}
                    aria-label="Choose an image"
                    onClick={() => inputRef.current?.click()}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            inputRef.current?.click();
                        }
                    }}
                    onDragOver={(event) => {
                        event.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(event) => {
                        event.preventDefault();
                        setDragging(false);
                        accept(event.dataTransfer.files[0]);
                    }}
                    className={cn(
                        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-surface px-6 py-10 text-center transition-colors",
                        "hover:border-brand focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                        dragging && "border-brand bg-brand/5",
                    )}
                >
                    {selected ? (
                        <img
                            src={selected.preview}
                            alt=""
                            className="size-24 rounded-full object-cover"
                        />
                    ) : (
                        <span className="flex size-12 items-center justify-center rounded-lg bg-muted text-brand">
                            <ImageUpIcon className="size-5" />
                        </span>
                    )}

                    <span className="flex flex-col gap-1">
                        <span className="text-sm font-medium">
                            {selected
                                ? selected.file.name
                                : "Drop An Image Here, Or Click To Choose"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            Up To 2 MB
                        </span>
                    </span>

                    <input
                        ref={inputRef}
                        type="file"
                        accept={ACCEPT}
                        className="hidden"
                        onChange={(event) => {
                            accept(event.target.files?.[0]);
                            event.target.value = "";
                        }}
                    />
                </div>

                {error && (
                    <p
                        role="alert"
                        className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    >
                        {error}
                    </p>
                )}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="cursor-pointer px-4"
                        disabled={uploading}
                        onClick={() => handleOpenChange(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        size="lg"
                        className="cursor-pointer gap-2 px-4"
                        disabled={!selected || uploading}
                        onClick={handleSave}
                    >
                        {uploading && <SpinnerRing />}
                        Save picture
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export { AvatarUploadDialog };
