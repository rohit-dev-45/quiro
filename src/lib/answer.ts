import {
    describeGroqError,
    groq,
    GROQ_REQUEST_DEFAULTS,
    GROQ_SYSTEM_MESSAGE,
} from "@/lib/groq";
import type { ChatSource } from "@/lib/chat";
import { toDocumentContext, type DocumentPayload } from "@/lib/documents";

export type AnswerEvent =
    | { type: "text"; value: string }
    | { type: "done"; sources: ChatSource[] }
    | { type: "error"; value: string };

type ChatMessage = {
    role: "system" | "user" | "assistant";
    content: string;
};

const MAX_CITATION_CHARS = 200;

const normalize = (value: string) => value.trim().toLowerCase();

function findDocument(name: string, documents: DocumentPayload[]) {
    const wanted = normalize(name);
    if (!wanted) return undefined;

    return (
        documents.find((document) => normalize(document.name) === wanted) ??
        documents.find((document) => {
            const actual = normalize(document.name);
            return actual.includes(wanted) || wanted.includes(actual);
        })
    );
}

export function resolveCitation(
    inner: string,
    documents: DocumentPayload[],
    sources: ChatSource[],
    indexByKey: Map<string, number>,
): string | null {
    const match = inner.match(/^(.*?)(?:,\s*(?:pp?\.?|pages?)\s*(\d+).*)?$/i);
    if (!match) return null;

    const origin = findDocument(match[1], documents);
    if (!origin) return null;

    const page = match[2] ? Number(match[2]) : null;
    const key = `${origin.name}#${page ?? ""}`;

    let source = sources.find(
        (candidate) => candidate.index === indexByKey.get(key),
    );

    if (!source) {
        source = {
            index: sources.length + 1,
            documentId: origin.id,
            document: origin.name,
            page,
            passages: [],
        };
        sources.push(source);
        indexByKey.set(key, source.index);
    }

    return `[${source.index}]`;
}

class CitationStream {
    private pending = "";

    constructor(private readonly resolve: (inner: string) => string | null) {}

    push(chunk: string) {
        let out = "";

        for (const char of chunk) {
            if (!this.pending) {
                if (char === "[") this.pending = "[";
                else out += char;
                continue;
            }

            if (char === "[") {
                out += this.pending;
                this.pending = "[";
                continue;
            }

            this.pending += char;

            if (char === "]") {
                out += this.resolve(this.pending.slice(1, -1)) ?? this.pending;
                this.pending = "";
            } else if (
                char === "\n" ||
                this.pending.length > MAX_CITATION_CHARS
            ) {
                out += this.pending;
                this.pending = "";
            }
        }

        return out;
    }

    flush() {
        const rest = this.pending;
        this.pending = "";
        return rest;
    }
}

export function buildMessages(
    documents: DocumentPayload[],
    history: { role: "USER" | "ASSISTANT"; content: string }[],
): ChatMessage[] {
    const context = documents.map(toDocumentContext).join("\n\n");

    const messages = history.map((message, index): ChatMessage => {
        const role = message.role === "USER" ? "user" : "assistant";

        return index === 0 && context
            ? { role, content: `${context}\n\n${message.content}` }
            : { role, content: message.content };
    });

    return [GROQ_SYSTEM_MESSAGE, ...messages];
}

export async function* streamAnswer(
    documents: DocumentPayload[],
    history: { role: "USER" | "ASSISTANT"; content: string }[],
): AsyncGenerator<AnswerEvent> {
    const sources: ChatSource[] = [];
    const indexByKey = new Map<string, number>();

    const citations = new CitationStream((inner) =>
        resolveCitation(inner, documents, sources, indexByKey),
    );

    try {
        const stream = await groq.chat.completions.create({
            ...GROQ_REQUEST_DEFAULTS,
            messages: buildMessages(documents, history),
            stream: true,
        });

        let truncated = false;

        for await (const chunk of stream) {
            const choice = chunk.choices[0];

            const delta = choice?.delta?.content;
            if (delta) {
                const value = citations.push(delta);
                if (value) yield { type: "text", value };
            }

            if (choice?.finish_reason === "length") truncated = true;
        }

        const rest = citations.flush();
        if (rest) yield { type: "text", value: rest };

        if (truncated) {
            yield {
                type: "text",
                value: "\n\n_The Answer Was Cut Off. Ask Me To Continue._",
            };
        }

        yield { type: "done", sources };
    } catch (error) {
        console.error("[chat] Answer Failed", error);
        yield { type: "error", value: describeGroqError(error) };
    }
}
