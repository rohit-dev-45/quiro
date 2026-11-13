import { APP_ROOT } from "@/lib/dashboard-nav";

export const CHATS_ROUTE = `${APP_ROOT}/chats`;

export function chatRoute(chatId: string) {
    return `${CHATS_ROUTE}/${chatId}`;
}

export function chatQuestionHref(
    chatId: string,
    question: string,
    { autoAsk = false }: { autoAsk?: boolean } = {},
) {
    const params = new URLSearchParams({ q: question });

    if (autoAsk) params.set("ask", "1");

    return `${chatRoute(chatId)}?${params}`;
}

export const DOCUMENT_ACCEPT = ".pdf,.docx,.txt,.md";

export const DOCUMENT_FORMATS_LABEL = "PDF, Word, Text, Markdown · Up To 15 MB";

export const MAX_DOCUMENTS_PER_CHAT = 20;

export type QuestionAllowance = {
    used: number;
    limit: number;
    remaining: number;
    spent: boolean;
};

export function questionAllowance(
    used: number,
    limit: number,
): QuestionAllowance {
    return {
        used,
        limit,
        remaining: Math.max(0, limit - used),
        spent: used >= limit,
    };
}

export function isUnlimited(limit: number) {
    return !Number.isFinite(limit);
}

export function formatQuestionCount(used: number, limit: number) {
    return isUnlimited(limit)
        ? `${used} ${used === 1 ? "question" : "questions"}`
        : `${used} / ${limit} questions`;
}

export function allowanceSpentMessage(limit: number) {
    return `You've Used All ${limit} Questions On Your Plan This Month. Your Allowance Resets On The 1st, Or Upgrade For More.`;
}

export function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function toPlainText(markdown: string) {
    return markdown
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/\s?\[\d+(?::\d+)?\]/g, "")
        .replace(/^\s{0,3}(?:#{1,6}|>|[-*+])\s+/gm, "")
        .replace(/^\s{0,3}\d+\.\s+/gm, "")
        .replace(/^\s{0,3}(?:[-*_]\s*){3,}$/gm, " ")
        .replace(/\|/g, " ")
        .replace(/(\*\*|__)(.*?)\1/g, "$2")
        .replace(/(\*|_)(?=\S)(.*?)(?<=\S)\1/g, "$2")
        .replace(/\s+/g, " ")
        .trim();
}

export type DocumentStatusView = "PROCESSING" | "READY" | "FAILED";

export type LibraryDocumentView = {
    id: string;
    name: string;
    meta: string;
    format: string;
    status: DocumentStatusView;
};

export type ChatSourcePassage = {
    text: string;
    before: string | null;
    after: string | null;
};

export type ChatSource = {
    index: number;
    documentId: string | null;
    document: string;
    page: number | null;
    passages: ChatSourcePassage[];
};

export type MessageFeedbackView = "UP" | "DOWN" | null;

export type ChatMessageView = {
    id: string;
    role: "user" | "assistant";
    content: string;
    sources: ChatSource[];
    feedback: MessageFeedbackView;
};

export type ChatSummary = {
    id: string;
    title: string;
    updatedAt: string;
    preview: string | null;
};

export type ChatDocumentView = {
    id: string;
    name: string;
};

export type ChatDetail = {
    id: string;
    title: string;
    documents: ChatDocumentView[];
    questionsThisMonth: number;
    questionLimit: number;
    messages: ChatMessageView[];
    pendingAnswer: boolean;
};
