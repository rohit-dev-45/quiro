"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { DOCUMENT_ACCEPT } from "@/lib/chat";
import { UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

function LibraryUploadButton() {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [progress, setProgress] = useState<string | null>(null);

    async function upload(files: File[]) {
        if (files.length === 0) return;

        let uploaded = 0;

        for (const [index, file] of files.entries()) {
            setProgress(
                files.length === 1
                    ? "Reading Document…"
                    : `Reading ${index + 1} Of ${files.length}…`,
            );

            const body = new FormData();
            body.append("file", file);

            try {
                const response = await fetch("/api/documents", {
                    method: "POST",
                    body,
                });

                if (!response.ok) {
                    const detail = await response.json().catch(() => null);

                    toast.add({
                        title: `Couldn't Add ${file.name}.`,
                        description: detail?.error ?? "Try Again In a Moment.",
                    });
                    continue;
                }

                uploaded += 1;
            } catch {
                toast.add({
                    title: `Couldn't Add ${file.name}.`,
                    description: "Check Your Connection And Try Again.",
                });
            }
        }

        setProgress(null);

        if (uploaded > 0) {
            toast.add({
                title: `${uploaded} Document${uploaded === 1 ? "" : "s"} Added To Your Library.`,
                description: "Indexed And Ready To Be Asked About.",
            });

            router.refresh();
        }
    }

    return (
        <>
            <Button
                size="lg"
                disabled={progress !== null}
                onClick={() => inputRef.current?.click()}
                className="h-10 cursor-pointer px-4"
            >
                {progress ? (
                    <Spinner data-icon="inline-start" />
                ) : (
                    <UploadIcon data-icon="inline-start" />
                )}
                {progress ?? "Upload Documents"}
            </Button>

            <input
                ref={inputRef}
                type="file"
                multiple
                accept={DOCUMENT_ACCEPT}
                className="sr-only"
                onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    event.target.value = "";
                    upload(files);
                }}
            />
        </>
    );
}

export { LibraryUploadButton };
