import Link from "next/link";
import { Button } from "../ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
} from "../ui/pagination";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { pageNumbers } from "@/lib/pagination";

function PageLink({
    href,
    isActive,
    label,
    className,
    children,
}: {
    href: string | null;
    isActive?: boolean;
    label?: string;
    className?: string;
    children: React.ReactNode;
}) {
    if (!href) {
        return (
            <Button variant="outline" size="lg" disabled className={className}>
                {children}
            </Button>
        );
    }

    return (
        <Button
            variant={isActive ? "default" : "outline"}
            size="lg"
            nativeButton={false}
            className={className}
            render={
                <Link
                    href={href}
                    scroll={false}
                    aria-label={label}
                    aria-current={isActive ? "page" : undefined}
                />
            }
        >
            {children}
        </Button>
    );
}

function Pager({
    page,
    pageCount,
    hrefFor,
}: {
    page: number;
    pageCount: number;
    hrefFor: (page: number) => string;
}) {
    if (pageCount <= 1) return null;

    return (
        <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent className="gap-1">
                <PaginationItem>
                    <PageLink
                        href={page > 1 ? hrefFor(page - 1) : null}
                        label="Previous page"
                        className="pl-1.5!"
                    >
                        <ChevronLeftIcon data-icon="inline-start" />
                        <span className="hidden sm:block">Previous</span>
                    </PageLink>
                </PaginationItem>

                {pageNumbers(page, pageCount).map((number, index) =>
                    number === "ellipsis" ? (
                        <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis className="size-9" />
                        </PaginationItem>
                    ) : (
                        <PaginationItem key={number}>
                            <PageLink
                                href={hrefFor(number)}
                                isActive={number === page}
                                label={`Page ${number}`}
                                className="w-9 tabular-nums"
                            >
                                {number}
                            </PageLink>
                        </PaginationItem>
                    ),
                )}

                <PaginationItem>
                    <PageLink
                        href={page < pageCount ? hrefFor(page + 1) : null}
                        label="Next page"
                        className="pr-1.5!"
                    >
                        <span className="hidden sm:block">Next</span>
                        <ChevronRightIcon data-icon="inline-end" />
                    </PageLink>
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}

export { Pager };
