import { badgeVariants } from "@/components/ui/badge";
import { searchHref, SearchScopeView } from "@/lib/search";
import { cn } from "@/lib/utils";
import Link from "next/link";

function SearchScope({
    scopes,
    scope,
    query,
}: {
    scopes: SearchScopeView[];
    scope: string;
    query: string;
}) {
    return (
        <nav
            aria-label="Search scope"
            className="flex flex-wrap items-center gap-2"
        >
            <span className="text-sm text-muted-foreground">Scope</span>

            {scopes.map((option) => {
                const isActive = option.value === scope;

                return (
                    <Link
                        key={option.value}
                        href={searchHref({ query, scope: option.value })}
                        aria-current={isActive ? "true" : undefined}
                        className={cn(
                            badgeVariants({ variant: "outline" }),
                            "h-8 gap-1.5 px-3 text-sm transition-colors hover:bg-muted",
                            isActive &&
                                "border-brand/40 bg-brand/10 text-brand hover:bg-brand/15",
                        )}
                    >
                        {option.label}
                        <span
                            aria-hidden
                            className={cn(
                                isActive
                                    ? "text-brand/60"
                                    : "text-muted-foreground",
                            )}
                        >
                            ·
                        </span>
                        <span className="tabular-nums">{option.count}</span>
                    </Link>
                );
            })}
        </nav>
    );
}

export { SearchScope };
