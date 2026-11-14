"use client";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useLinkStatus } from "next/link";

function LibraryTabCount({
    count,
    isActive,
}: {
    count: number;
    isActive: boolean;
}) {
    const { pending } = useLinkStatus();

    return (
        <span
            className={cn(
                "relative grid min-w-3 place-items-center tabular-nums",
                isActive ? "text-muted-foreground" : "text-muted-foreground/60",
            )}
        >
            <span
                className={cn(
                    "col-start-1 row-start-1",
                    pending && "opacity-0",
                )}
            >
                {count}
            </span>

            {pending && (
                <Spinner
                    className="col-start-1 row-start-1 size-3"
                    aria-label="Loading"
                />
            )}
        </span>
    );
}

export { LibraryTabCount };
