import { Skeleton } from "@/components/ui/skeleton";
import { SEARCH_PAGE_SIZE } from "@/lib/search";

function SearchResultsSkeleton({ rows = SEARCH_PAGE_SIZE }: { rows?: number }) {
    return (
        <div aria-hidden>
            <Skeleton className="h-18.5 w-full rounded-xl" />

            <ul className="mt-6 flex flex-col gap-4">
                {Array.from({ length: rows }, (_, index) => (
                    <li
                        key={index}
                        className="rounded-xl border bg-card px-5 py-4"
                    >
                        <div className="flex items-start gap-3">
                            <Skeleton className="size-8 shrink-0 rounded-lg" />
                            <Skeleton className="mt-1 h-4 w-64 max-w-[50%] flex-1" />
                            <Skeleton className="h-5 w-20 shrink-0 rounded-md" />
                        </div>

                        <div className="mt-3 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export { SearchResultsSkeleton };
