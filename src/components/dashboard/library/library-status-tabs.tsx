import { buttonVariants } from "@/components/ui/button";
import {
    LibraryCountsView,
    libraryHref,
    LibraryStatusFilter,
    libraryStatusFilters,
} from "@/lib/library";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LibraryTabCount } from "./library-tab-count";

function LibraryStatusTabs({
    status,
    query,
    counts,
}: {
    status: LibraryStatusFilter;
    query: string;
    counts: LibraryCountsView["counts"];
}) {
    return (
        <nav
            aria-label="Filter documents by status"
            className="inline-flex h-10 max-w-full scrollbar-none items-center gap-1 overflow-x-auto rounded-lg bg-muted p-1"
        >
            {libraryStatusFilters.map((filter) => {
                const isActive = filter.value === status;

                return (
                    <Link
                        key={filter.value}
                        href={libraryHref({ status: filter.value, query })}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "h-8 gap-1.5 px-3 text-sm text-muted-foreground hover:bg-transparent hover:text-foreground",
                            isActive &&
                                "bg-background text-foreground shadow-sm hover:bg-background dark:bg-input/30",
                        )}
                    >
                        {filter.label}
                        <LibraryTabCount
                            count={counts[filter.value]}
                            isActive={isActive}
                        />
                    </Link>
                );
            })}
        </nav>
    );
}

export { LibraryStatusTabs };
