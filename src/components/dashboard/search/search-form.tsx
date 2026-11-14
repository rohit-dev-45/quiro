"use client";

import { Button } from "@/components/ui/button";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { SEARCH_QUERY_MAX, searchHref } from "@/lib/search";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

function SearchForm({ query, scope }: { query: string; scope: string }) {
    const router = useRouter();
    const [value, setValue] = useState(query);
    const [isPending, startTransition] = useTransition();

    const [seen, setSeen] = useState(query);
    if (query !== seen) {
        setSeen(query);
        setValue(query);
    }

    return (
        <form
            role="search"
            onSubmit={(event) => {
                event.preventDefault();
                startTransition(() => {
                    router.push(searchHref({ query: value, scope }));
                });
            }}
        >
            <InputGroup className="h-14 rounded-xl pr-1.5 pl-1.5 shadow-sm">
                <InputGroupAddon className="pl-2.5">
                    <SearchIcon className="size-5 text-muted-foreground" />
                </InputGroupAddon>

                <InputGroupInput
                    autoFocus
                    name="q"
                    value={value}
                    maxLength={SEARCH_QUERY_MAX}
                    placeholder="Search Across Your Documents…"
                    aria-label="Search across your documents"
                    onChange={(event) => setValue(event.target.value)}
                    className="text-base md:text-base"
                />

                <InputGroupAddon align="inline-end">
                    <Button
                        type="submit"
                        size="lg"
                        disabled={isPending || value.trim().length === 0}
                        className="h-11 cursor-pointer px-5"
                    >
                        {isPending && <Spinner data-icon="inline-start" />}
                        Search
                    </Button>
                </InputGroupAddon>
            </InputGroup>
        </form>
    );
}

export { SearchForm };
