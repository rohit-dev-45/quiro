import { searchPassages } from "@/lib/chat-store";
import { requireOrganization } from "@/lib/session";

async function SearchResultCount({
    query,
    scope,
    page,
}: {
    query: string;
    scope: string;
    page: number;
}) {
    const organization = await requireOrganization();
    const results = await searchPassages(organization.id, query, scope, page);

    if (results.total === 0) return null;

    return (
        <p className="font-mono text-sm text-muted-foreground">
            {results.total} {results.total === 1 ? "Passage" : "Passages"} ·{" "}
            {results.documentCount}{" "}
            {results.documentCount === 1 ? "Document" : "Documents"}
        </p>
    );
}

export { SearchResultCount };
