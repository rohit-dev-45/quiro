import { SearchForm } from "@/components/dashboard/search/search-form";
import { SearchResultCount } from "@/components/dashboard/search/search-result-count";
import { SearchResults } from "@/components/dashboard/search/search-results";
import { SearchResultsSkeleton } from "@/components/dashboard/search/search-results-skeleton";
import { SearchScope } from "@/components/dashboard/search/search-scope";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { getSearchScopes, listChats } from "@/lib/chat-store";
import { SEARCH_QUERY_MAX, toSearchScope } from "@/lib/search";
import { requireOrganization } from "@/lib/session";
import { SearchIcon } from "lucide-react";
import { Metadata } from "next";
import React, { Suspense } from "react";

export const metadata: Metadata = {
    title: "Search",
};

function first(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

const SearchPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const organization = await requireOrganization();
    const params = await searchParams;

    const query = (first(params.q) ?? "").trim().slice(0, SEARCH_QUERY_MAX);
    const requestedPage = Number.parseInt(first(params.page) ?? "1", 10);
    const page = Number.isNaN(requestedPage) ? 1 : requestedPage;

    const { scopes, searchableTotal, unsearchableTotal } =
        await getSearchScopes(organization.id);
    const scope = toSearchScope(first(params.scope), scopes);

    const chats = query ? await listChats(organization.id) : [];

    return (
        <div className="mx-auto w-full max-w-4xl px-6 py-10">
            <SearchForm query={query} scope={scope} />

            {searchableTotal === 0 ? (
                <Empty className="mt-8 rounded-xl border border-dashed py-16">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <SearchIcon />
                        </EmptyMedia>
                        <EmptyTitle>Nothing To Search Yet</EmptyTitle>
                        <EmptyDescription>
                            {unsearchableTotal > 0
                                ? `Your Library Holds ${unsearchableTotal} Document${unsearchableTotal === 1 ? "" : "s"}, But ${unsearchableTotal === 1 ? "It Is a PDF" : "They Are All PDFs"}. Quiro Reads Those Directly In A Chat Rather Than Indexing Their Text, So Passage Search Can't See Them. Upload A Word, Text Or Markdown File To Search Across.`
                                : "Upload A Document To The Library And Its Text Becomes Searchable Here."}
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <SearchScope
                            scopes={scopes}
                            scope={scope}
                            query={query}
                        />

                        {query && (
                            <Suspense
                                key={`count|${query}|${scope}`}
                                fallback={<Skeleton className="h-4 w-40" />}
                            >
                                <SearchResultCount
                                    query={query}
                                    scope={scope}
                                    page={page}
                                />
                            </Suspense>
                        )}
                    </div>

                    {unsearchableTotal > 0 && (
                        <p className="mt-3 text-sm text-muted-foreground">
                            {unsearchableTotal} PDF
                            {unsearchableTotal === 1 ? "" : "s"}{" "}
                            {unsearchableTotal === 1 ? "Isn't" : "Aren't"}{" "}
                            Included — Quiro Reads Those Directly In A Chat
                            Rather Than Indexing Their Text.
                        </p>
                    )}

                    {query ? (
                        <div className="mt-6">
                            <Suspense
                                key={`${query}|${scope}|${page}`}
                                fallback={<SearchResultsSkeleton />}
                            >
                                <SearchResults
                                    query={query}
                                    scope={scope}
                                    page={page}
                                    chatId={chats[0]?.id ?? null}
                                />
                            </Suspense>
                        </div>
                    ) : (
                        <Empty className="mt-6 rounded-xl border border-dashed py-16">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <SearchIcon />
                                </EmptyMedia>
                                <EmptyTitle>Search Your Documents</EmptyTitle>
                                <EmptyDescription>
                                    Type A Phrase To Find The Passages That
                                    Mention It, Across Every Document In Scope.
                                    Quiro Shows You Where It Appears Before You
                                    Ask About It.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    )}
                </>
            )}
        </div>
    );
};

export default SearchPage;
