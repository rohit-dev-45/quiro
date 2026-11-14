import { LibraryFilter } from "@/components/dashboard/library/library-filter";
import { LibraryStatusTabs } from "@/components/dashboard/library/library-status-tabs";
import { LibraryTable } from "@/components/dashboard/library/library-table";
import { LibraryTableSkeleton } from "@/components/dashboard/library/library-table-skeleton";
import { LibraryUploadButton } from "@/components/dashboard/library/library-upload-button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { getLibraryCounts } from "@/lib/chat-store";
import {
    LIBRARY_PAGE_SIZE,
    LIBRARY_QUERY_MAX,
    toLibraryStatusFilter,
} from "@/lib/library";
import { requireOrganization } from "@/lib/session";
import { LibraryIcon } from "lucide-react";
import { Metadata } from "next";
import React, { Suspense } from "react";

export const metadata: Metadata = {
    title: "Library",
};

function first(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

const LibraryPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const organization = await requireOrganization();
    const params = await searchParams;

    const status = toLibraryStatusFilter(first(params.status));
    const query = (first(params.q) ?? "").trim().slice(0, LIBRARY_QUERY_MAX);
    const requestedPage = Number.parseInt(first(params.page) ?? "1", 10);
    const page = Number.isNaN(requestedPage) ? 1 : requestedPage;

    const library = await getLibraryCounts({
        organizationId: organization.id,
        query,
    });

    return (
        <div className="mx-auto w-full max-w-272 px-6 py-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="font-heading text-3xl font-bold tracking-tight">
                        Library
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                        {library.libraryTotal === 0
                            ? "Nothing Uploaded Yet."
                            : `${library.libraryTotal} ${library.libraryTotal === 1 ? "Document" : "Documents"} · Indexed And Searchable By Meaning.`}
                    </p>
                </div>

                <LibraryUploadButton />
            </div>

            {library.libraryTotal === 0 ? (
                <Empty className="mt-8 rounded-xl border border-dashed py-16">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <LibraryIcon />
                        </EmptyMedia>
                        <EmptyTitle>Your Library Is Empty</EmptyTitle>
                        <EmptyDescription>
                            Upload a PDF, Word File, Or Markdown Brief. Quiro
                            Reads It Once, Then Every Chat After That Can Cite
                            It.
                        </EmptyDescription>
                    </EmptyHeader>

                    <EmptyContent>
                        <LibraryUploadButton />
                    </EmptyContent>
                </Empty>
            ) : (
                <>
                    <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                        <LibraryStatusTabs
                            status={status}
                            query={query}
                            counts={library.counts}
                        />

                        <LibraryFilter status={status} query={query} />
                    </div>

                    <Suspense
                        key={`${status}|${query}|${page}`}
                        fallback={
                            <LibraryTableSkeleton
                                rows={
                                    Math.min(
                                        library.counts[status],
                                        LIBRARY_PAGE_SIZE,
                                    ) || 1
                                }
                            />
                        }
                    >
                        <LibraryTable
                            status={status}
                            query={query}
                            page={page}
                        />
                    </Suspense>
                </>
            )}
        </div>
    );
};

export default LibraryPage;
