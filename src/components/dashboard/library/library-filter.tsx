"use client";

import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import {
    LIBRARY_QUERY_MAX,
    libraryHref,
    LibraryStatusFilter,
} from "@/lib/library";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const DEBOUNCE_MS = 300;

function LibraryFilter({
    status,
    query,
}: {
    status: LibraryStatusFilter;
    query: string;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [value, setValue] = useState(query);
    const [seen, setSeen] = useState(query);
    const [sent, setSent] = useState(query);

    if (query !== seen) {
        setSeen(query);

        if (query !== sent) {
            setSent(query);
            setValue(query);
        }
    }

    useEffect(() => {
        const next = value.trim();

        if (next === sent) return;

        const timer = setTimeout(() => {
            setSent(next);

            startTransition(() => {
                router.replace(libraryHref({ status, query: next }), {
                    scroll: false,
                });
            });
        }, DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [value, sent, status, router]);

    return (
        <InputGroup className="h-10 w-full rounded-lg sm:w-72">
            <InputGroupAddon>
                <SearchIcon />
            </InputGroupAddon>

            <InputGroupInput
                type="search"
                value={value}
                maxLength={LIBRARY_QUERY_MAX}
                placeholder="Filter By Name…"
                aria-label="Filter documents by name"
                onChange={(event) => setValue(event.target.value)}
            />

            {isPending && (
                <InputGroupAddon align="inline-end">
                    <Spinner className="size-4" />
                </InputGroupAddon>
            )}
        </InputGroup>
    );
}

export { LibraryFilter };
