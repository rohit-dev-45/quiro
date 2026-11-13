import { cache } from "react";

import {
    getWorkspacePlan,
    getWorkspaceQuestionLimit,
} from "@/lib/billing-store";
import { planQuestionLimit, type PlanId } from "@/lib/billing";
import { db } from "@/lib/db";
import {
    questionAllowance,
    toPlainText,
    type QuestionAllowance,
} from "@/lib/chat";
import type {
    ChatDetail,
    ChatMessageView,
    ChatSource,
    ChatSummary,
    LibraryDocumentView,
    MessageFeedbackView,
} from "@/lib/chat";
import type { DashboardNavCounts } from "@/lib/dashboard-nav";
import { documentMeta, type DocumentPayload } from "@/lib/documents";
import {
    LIBRARY_PAGE_SIZE,
    libraryStatusFilters,
    type LibraryCountsView,
    type LibraryRowsView,
    type LibraryStatusFilter,
} from "@/lib/library";
import { clampPage } from "@/lib/pagination";
import {
    usagePeriod,
    USAGE_CHART_DAYS,
    USAGE_TOP_DOCUMENTS,
    type UsageView,
} from "@/lib/usage";
import {
    scorePassage,
    SEARCH_PAGE_SIZE,
    searchStems,
    splitPassages,
    type SearchPassageView,
    type SearchResultsView,
    type SearchScopeView,
} from "@/lib/search";

export async function countQuestionsThisMonth(organizationId: string) {
    const now = new Date();

    return db.questionEvent.count({
        where: {
            organizationId,
            createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
        },
    });
}

export async function getQuestionAllowance(
    organizationId: string,
): Promise<QuestionAllowance> {
    const [used, limit] = await Promise.all([
        countQuestionsThisMonth(organizationId),
        getWorkspaceQuestionLimit(organizationId),
    ]);

    return questionAllowance(used, limit);
}

export async function recordQuestion({
    organizationId,
    userId,
    chatId,
}: {
    organizationId: string;
    userId: string;
    chatId: string;
}) {
    await db.questionEvent.create({ data: { organizationId, userId, chatId } });
}

export async function listChats(
    organizationId: string,
): Promise<ChatSummary[]> {
    const chats = await db.chat.findMany({
        where: { organizationId },
        orderBy: { updatedAt: "desc" },
        take: 50,
        select: {
            id: true,
            title: true,
            updatedAt: true,
            messages: {
                where: { role: "ASSISTANT" },
                orderBy: { createdAt: "desc" },
                take: 1,
                select: { content: true },
            },
        },
    });

    return chats.map((chat) => ({
        id: chat.id,
        title: chat.title,
        updatedAt: chat.updatedAt.toISOString(),
        preview: chat.messages[0]
            ? toPlainText(chat.messages[0].content.slice(0, 600)).slice(
                  0,
                  140,
              ) || null
            : null,
    }));
}

export async function listLibraryDocuments(
    organizationId: string,
): Promise<LibraryDocumentView[]> {
    const documents = await db.document.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            sizeBytes: true,
            pageCount: true,
            contentType: true,
            status: true,
        },
    });

    return documents.map((document) => ({
        id: document.id,
        name: document.name,
        meta: documentMeta(document.sizeBytes, document.pageCount),
        format: document.name.split(".").pop()?.toUpperCase() ?? "FILE",
        status: document.status,
    }));
}

function libraryNameFilter(organizationId: string, query: string) {
    const search = query.trim();

    return {
        organizationId,
        ...(search
            ? { name: { contains: search, mode: "insensitive" as const } }
            : {}),
    };
}

export async function getLibraryCounts({
    organizationId,
    query = "",
}: {
    organizationId: string;
    query?: string;
}): Promise<LibraryCountsView> {
    const [libraryTotal, byStatus] = await Promise.all([
        db.document.count({ where: { organizationId } }),
        db.document.groupBy({
            by: ["status"],
            where: libraryNameFilter(organizationId, query),
            _count: true,
        }),
    ]);

    const tally = new Map(byStatus.map((row) => [row.status, row._count]));

    return {
        libraryTotal,
        counts: {
            all: byStatus.reduce((sum, row) => sum + row._count, 0),
            indexed: tally.get("READY") ?? 0,
            indexing: tally.get("PROCESSING") ?? 0,
            failed: tally.get("FAILED") ?? 0,
        },
    };
}

export async function getLibraryRows({
    organizationId,
    status = "all",
    query = "",
    page = 1,
}: {
    organizationId: string;
    status?: LibraryStatusFilter;
    query?: string;
    page?: number;
}): Promise<LibraryRowsView> {
    const activeStatus = libraryStatusFilters.find(
        (filter) => filter.value === status,
    )?.status;

    const matchingName = libraryNameFilter(organizationId, query);
    const scoped = activeStatus
        ? { ...matchingName, status: activeStatus }
        : matchingName;

    const total = await db.document.count({ where: scoped });
    const { page: current, pageCount } = clampPage(
        page,
        total,
        LIBRARY_PAGE_SIZE,
    );

    const documents = await db.document.findMany({
        where: scoped,
        orderBy: { createdAt: "desc" },
        skip: (current - 1) * LIBRARY_PAGE_SIZE,
        take: LIBRARY_PAGE_SIZE,
        select: {
            id: true,
            name: true,
            sizeBytes: true,
            pageCount: true,
            status: true,
            createdAt: true,
            _count: { select: { chats: true } },
        },
    });

    return {
        documents: documents.map((document) => ({
            id: document.id,
            name: document.name,
            meta: documentMeta(document.sizeBytes, document.pageCount),
            format: document.name.split(".").pop()?.toUpperCase() ?? "FILE",
            status: document.status,
            createdAt: document.createdAt.toISOString(),
            chatCount: document._count.chats,
        })),
        total,
        page: current,
        pageCount,
    };
}

function documentFormat(name: string) {
    return name.split(".").pop()?.toUpperCase() ?? "FILE";
}

export async function getSearchScopes(organizationId: string): Promise<{
    scopes: SearchScopeView[];
    searchableTotal: number;
    unsearchableTotal: number;
}> {
    const documents = await db.document.findMany({
        where: { organizationId, status: "READY" },
        select: { name: true, text: true },
    });

    const byFormat = new Map<string, number>();
    let searchableTotal = 0;
    let unsearchableTotal = 0;

    for (const document of documents) {
        if (document.text === null) {
            unsearchableTotal += 1;
            continue;
        }

        searchableTotal += 1;
        const format = documentFormat(document.name);
        byFormat.set(format, (byFormat.get(format) ?? 0) + 1);
    }

    const scopes: SearchScopeView[] = [
        { value: "all", label: "All documents", count: searchableTotal },
        ...[...byFormat.entries()]
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
            .map(([format, count]) => ({
                value: format,
                label: format,
                count,
            })),
    ];

    return { scopes, searchableTotal, unsearchableTotal };
}

export const searchPassages = cache(async function searchPassages(
    organizationId: string,
    query: string,
    scope: string = "all",
    page: number = 1,
): Promise<SearchResultsView> {
    const stems = searchStems(query);

    const empty: SearchResultsView = {
        passages: [],
        total: 0,
        documentCount: 0,
        page: 1,
        pageCount: 1,
    };

    if (stems.length === 0) return empty;

    const candidates = await db.document.findMany({
        where: {
            organizationId,
            status: "READY",
            text: { not: null },
            OR: stems.map(({ stem }) => ({
                text: { contains: stem, mode: "insensitive" as const },
            })),
            ...(scope === "all"
                ? {}
                : {
                      name: {
                          endsWith: `.${scope.toLowerCase()}`,
                          mode: "insensitive" as const,
                      },
                  }),
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, pageCount: true, text: true },
    });

    const matched: SearchPassageView[] = [];

    for (const document of candidates) {
        const format = documentFormat(document.name);

        splitPassages(document.text ?? "").forEach((passage, index) => {
            const scored = scorePassage(passage, stems);
            if (!scored) return;

            matched.push({
                id: `${document.id}:${index}`,
                documentId: document.id,
                documentName: document.name,
                format,
                page: null,
                ...scored,
            });
        });
    }

    matched.sort(
        (a, b) =>
            b.score - a.score || a.documentName.localeCompare(b.documentName),
    );

    const total = matched.length;
    const { page: current, pageCount } = clampPage(
        page,
        total,
        SEARCH_PAGE_SIZE,
    );
    const start = (current - 1) * SEARCH_PAGE_SIZE;

    return {
        passages: matched.slice(start, start + SEARCH_PAGE_SIZE),
        total,
        documentCount: new Set(matched.map((passage) => passage.documentId))
            .size,
        page: current,
        pageCount,
    };
});

function localDay(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export async function getUsage(organizationId: string): Promise<UsageView> {
    const now = new Date();
    const period = usagePeriod(now);
    const monthStart = new Date(period.start);

    const chartStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - (USAGE_CHART_DAYS - 1),
    );

    const [documentsIndexed, questions, asked, recent, answers, documents] =
        await Promise.all([
            db.document.count({ where: { organizationId, status: "READY" } }),
            countQuestionsThisMonth(organizationId),
            db.questionEvent.findMany({
                where: { organizationId, createdAt: { gte: chartStart } },
                select: { createdAt: true },
            }),
            db.message.findMany({
                where: {
                    chat: { organizationId },
                    createdAt: {
                        gte: chartStart < monthStart ? chartStart : monthStart,
                    },
                },
                orderBy: { createdAt: "asc" },
                select: {
                    chatId: true,
                    role: true,
                    hidden: true,
                    createdAt: true,
                },
            }),
            db.message.findMany({
                where: { chat: { organizationId }, role: "ASSISTANT" },
                select: { sources: true },
            }),
            db.document.findMany({
                where: { organizationId },
                select: { id: true, name: true },
            }),
        ]);

    const perDay = new Map<string, number>();

    for (let offset = 0; offset < USAGE_CHART_DAYS; offset += 1) {
        const day = new Date(
            chartStart.getFullYear(),
            chartStart.getMonth(),
            chartStart.getDate() + offset,
        );
        perDay.set(localDay(day), 0);
    }

    for (const question of asked) {
        const key = localDay(question.createdAt);
        if (perDay.has(key)) perDay.set(key, (perDay.get(key) ?? 0) + 1);
    }

    const pendingByChat = new Map<string, Date>();
    const durations: number[] = [];

    for (const message of recent) {
        if (message.role === "USER") {
            pendingByChat.delete(message.chatId);
            if (!message.hidden)
                pendingByChat.set(message.chatId, message.createdAt);
            continue;
        }

        const asked = pendingByChat.get(message.chatId);
        if (!asked) continue;

        pendingByChat.delete(message.chatId);

        if (message.createdAt >= monthStart) {
            durations.push(
                (message.createdAt.getTime() - asked.getTime()) / 1000,
            );
        }
    }

    const nameById = new Map(
        documents.map((document) => [document.id, document.name]),
    );
    const citationsByDocument = new Map<string, number>();
    let citations = 0;

    for (const answer of answers) {
        if (!Array.isArray(answer.sources)) continue;

        const cited = new Set<string>();

        for (const source of answer.sources as {
            documentId?: string | null;
        }[]) {
            citations += 1;
            if (source?.documentId) cited.add(source.documentId);
        }

        for (const documentId of cited) {
            citationsByDocument.set(
                documentId,
                (citationsByDocument.get(documentId) ?? 0) + 1,
            );
        }
    }

    return {
        period,
        questions,
        questionLimit: await getWorkspaceQuestionLimit(organizationId),
        documentsIndexed,
        citations,
        averageAnswerSeconds:
            durations.length > 0
                ? durations.reduce((sum, value) => sum + value, 0) /
                  durations.length
                : null,
        days: [...perDay.entries()].map(([date, count]) => ({
            date,
            questions: count,
        })),
        documents: [...citationsByDocument.entries()]
            .filter(([documentId]) => nameById.has(documentId))
            .map(([documentId, count]) => ({
                id: documentId,
                name: nameById.get(documentId)!,
                questions: count,
            }))
            .sort(
                (a, b) =>
                    b.questions - a.questions || a.name.localeCompare(b.name),
            )
            .slice(0, USAGE_TOP_DOCUMENTS),
    };
}

export async function deleteDocument(
    documentId: string,
    organizationId: string,
) {
    const result = await db.document.deleteMany({
        where: { id: documentId, organizationId },
    });

    return result.count > 0;
}

export async function clearDocuments(organizationId: string) {
    const { count } = await db.document.deleteMany({
        where: { organizationId },
    });

    return count;
}

export async function getNavCounts(
    organizationId: string,
): Promise<DashboardNavCounts> {
    const [chats, documents] = await Promise.all([
        db.chat.count({ where: { organizationId } }),
        db.document.count({ where: { organizationId } }),
    ]);

    return { chats, documents };
}

function normaliseSources(value: unknown): ChatSource[] {
    if (!Array.isArray(value)) return [];

    return (value as Partial<ChatSource>[]).map((source, position) => ({
        index: source.index ?? position + 1,
        documentId: source.documentId ?? null,
        document: source.document ?? "Document",
        page: source.page ?? null,
        passages: source.passages ?? [],
    }));
}

function toMessageView(message: {
    id: string;
    role: "USER" | "ASSISTANT";
    content: string;
    sources: unknown;
    feedback: MessageFeedbackView;
}): ChatMessageView {
    return {
        id: message.id,
        role: message.role === "USER" ? "user" : "assistant",
        content: message.content,
        sources: normaliseSources(message.sources),
        feedback: message.feedback,
    };
}

export async function getChat(
    chatId: string,
    organizationId: string,
): Promise<ChatDetail | null> {
    const chat = await db.chat.findFirst({
        where: { id: chatId, organizationId },
        select: {
            id: true,
            title: true,
            documents: {
                orderBy: { position: "asc" },
                select: { document: { select: { id: true, name: true } } },
            },
            messages: {
                orderBy: { createdAt: "asc" },
                select: {
                    id: true,
                    role: true,
                    content: true,
                    sources: true,
                    hidden: true,
                    feedback: true,
                },
            },
        },
    });

    if (!chat) return null;

    const last = chat.messages.at(-1);
    const [questionsThisMonth, questionLimit] = await Promise.all([
        countQuestionsThisMonth(organizationId),
        getWorkspaceQuestionLimit(organizationId),
    ]);

    return {
        id: chat.id,
        title: chat.title,
        documents: chat.documents.map((link) => link.document),
        questionsThisMonth,
        questionLimit,
        messages: chat.messages
            .filter((message) => !message.hidden)
            .map(toMessageView),
        pendingAnswer: last?.role === "USER",
    };
}

export async function getChatDocuments(
    chatId: string,
): Promise<DocumentPayload[]> {
    const links = await db.chatDocument.findMany({
        where: { chatId },
        orderBy: { position: "asc" },
        select: {
            document: {
                select: {
                    id: true,
                    name: true,
                    contentType: true,
                    data: true,
                    text: true,
                },
            },
        },
    });

    return links.map(({ document }) => ({
        ...document,
        text: document.text ?? "",
    }));
}

export async function getChatHistory(chatId: string) {
    const messages = await db.message.findMany({
        where: { chatId },
        orderBy: { createdAt: "asc" },
        select: { role: true, content: true },
    });

    return messages;
}

export async function createChat({
    organizationId,
    userId,
    documentIds,
    title,
    seedPrompt,
}: {
    organizationId: string;
    userId: string;
    documentIds: string[];
    title: string;
    seedPrompt: string;
}) {
    return db.chat.create({
        data: {
            organizationId,
            userId,
            title,
            documents: {
                create: documentIds.map((documentId, position) => ({
                    documentId,
                    position,
                })),
            },
            messages: {
                create: { role: "USER", content: seedPrompt, hidden: true },
            },
        },
        select: { id: true },
    });
}

export async function readyDocumentIds(
    documentIds: string[],
    organizationId: string,
) {
    const documents = await db.document.findMany({
        where: { id: { in: documentIds }, organizationId, status: "READY" },
        select: { id: true, name: true },
    });

    return documents;
}

export async function addMessage({
    chatId,
    role,
    content,
    sources,
}: {
    chatId: string;
    role: "USER" | "ASSISTANT";
    content: string;
    sources?: ChatSource[];
}) {
    const message = await db.message.create({
        data: { chatId, role, content, sources: sources ?? undefined },
        select: { id: true },
    });

    await db.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
    });

    return message;
}

export async function setMessageFeedback({
    messageId,
    chatId,
    organizationId,
    feedback,
}: {
    messageId: string;
    chatId: string;
    organizationId: string;
    feedback: MessageFeedbackView;
}) {
    const result = await db.message.updateMany({
        where: {
            id: messageId,
            role: "ASSISTANT",
            chat: { id: chatId, organizationId },
        },
        data: { feedback },
    });

    return result.count > 0;
}

export async function deleteChat(chatId: string, organizationId: string) {
    const chat = await db.chat.findFirst({
        where: { id: chatId, organizationId },
        select: { id: true, documents: { select: { documentId: true } } },
    });

    if (!chat) return null;

    const documentIds = chat.documents.map((link) => link.documentId);

    return db.$transaction(async (tx) => {
        await tx.chat.delete({ where: { id: chat.id } });

        const stillLinked = await tx.chatDocument.findMany({
            where: { documentId: { in: documentIds } },
            select: { documentId: true },
            distinct: ["documentId"],
        });

        const shared = new Set(stillLinked.map((link) => link.documentId));
        const orphaned = documentIds.filter((id) => !shared.has(id));

        if (orphaned.length > 0) {
            await tx.document.deleteMany({
                where: { id: { in: orphaned }, organizationId },
            });
        }

        return {
            deletedDocuments: orphaned.length,
            keptSharedDocuments: documentIds.length - orphaned.length,
        };
    });
}

export async function clearChats(organizationId: string) {
    const { count } = await db.chat.deleteMany({ where: { organizationId } });

    return count;
}

export async function attachDocuments({
    chatId,
    organizationId,
    documentIds,
    maxDocuments,
}: {
    chatId: string;
    organizationId: string;
    documentIds: string[];
    maxDocuments: number;
}) {
    const chat = await db.chat.findFirst({
        where: { id: chatId, organizationId },
        select: {
            id: true,
            documents: { select: { documentId: true, position: true } },
        },
    });

    if (!chat) return { ok: false as const, reason: "not-found" as const };

    const ready = await db.document.findMany({
        where: { id: { in: documentIds }, organizationId, status: "READY" },
        select: { id: true },
    });

    if (ready.length !== documentIds.length) {
        return { ok: false as const, reason: "unavailable" as const };
    }

    const existing = new Set(chat.documents.map((link) => link.documentId));
    const incoming = documentIds.filter((id) => !existing.has(id));

    if (incoming.length === 0) {
        return {
            ok: true as const,
            attached: 0,
            alreadyAttached: documentIds.length,
        };
    }

    if (existing.size + incoming.length > maxDocuments) {
        return { ok: false as const, reason: "too-many" as const };
    }

    const nextPosition =
        chat.documents.reduce(
            (highest, link) => Math.max(highest, link.position),
            -1,
        ) + 1;

    await db.chatDocument.createMany({
        data: incoming.map((documentId, offset) => ({
            chatId: chat.id,
            documentId,
            position: nextPosition + offset,
        })),
    });

    return {
        ok: true as const,
        attached: incoming.length,
        alreadyAttached: documentIds.length - incoming.length,
    };
}

export type WorkspaceStats = {
    documentsIndexed: number;
    documentsPending: number;
    questionsThisMonth: number;
    planId: PlanId;
    questionLimit: number;
};

export async function getWorkspaceStats(
    organizationId: string,
): Promise<WorkspaceStats> {
    const [documentsIndexed, documentsPending, questionsThisMonth, planId] =
        await Promise.all([
            db.document.count({ where: { organizationId, status: "READY" } }),
            db.document.count({
                where: { organizationId, status: { not: "READY" } },
            }),
            countQuestionsThisMonth(organizationId),
            getWorkspacePlan(organizationId),
        ]);

    return {
        documentsIndexed,
        documentsPending,
        questionsThisMonth,
        planId,
        questionLimit: planQuestionLimit(planId),
    };
}

export async function listRecentDocuments(
    organizationId: string,
    take = 3,
): Promise<LibraryDocumentView[]> {
    const documents = await db.document.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        take,
        select: {
            id: true,
            name: true,
            sizeBytes: true,
            pageCount: true,
            status: true,
        },
    });

    return documents.map((document) => ({
        id: document.id,
        name: document.name,
        meta: documentMeta(document.sizeBytes, document.pageCount),
        format: document.name.split(".").pop()?.toUpperCase() ?? "FILE",
        status: document.status,
    }));
}
