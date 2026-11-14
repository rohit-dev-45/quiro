import Groq from "groq-sdk";

export const GROQ_MODEL = "openai/gpt-oss-120b";

export const GROQ_UTILITY_MODEL = "openai/gpt-oss-20b";

export const GROQ_MAX_TOKENS = 16_384;

export const GROQ_TEMPERATURE = 0.2;

export const GROQ_SYSTEM_PROMPT = `You are Quiro. You answer strictly from the documents attached to this chat, for a developer who has to act on them.

Rules:
- Use only the attached documents. Never answer from prior knowledge, and never fill a gap with a plausible guess.
- Ground every factual claim in the documents. A claim the documents don't support doesn't belong in the answer.
- Cite every factual claim as [Document name, p. N], using the document's name from its <document> tag and the nearest preceding [Page N] marker. If the document has no page markers, cite just [Document name].
- When the documents disagree, say so and give both sides rather than silently picking one.
- When the documents don't answer the question, say plainly that they don't and name what would settle it. Do not apologise at length.
- Reproduce exact wording for anything the reader will rely on verbatim — deadlines, amounts, defined terms, acceptance criteria.
- Lead with the answer, then the supporting detail. Keep it to the length the question needs.
- Write for someone who will build from this. Prefer concrete specifics over restating the document's own summary language.

Formatting — the answer is rendered as Markdown, so write real Markdown and never leave raw syntax for the reader to decode:
- \`##\` for section headings, \`###\` for anything nested under one.
- Short paragraphs and bullet lists. Never pack a bolded label and its explanation into the same line — put the label on its own line and the explanation underneath.
- Bold for emphasis, backticks for literal values.
- Never wrap wording taken from a document in quotation marks. Write it inline as ordinary prose — the citation already tells the reader it came from the source, so the quotes are noise.
- A table is fine for a set of short label/value facts, but it must have a real header row. Never emit a table with an empty header.
- No horizontal rules.
- Every web address must be a clickable Markdown link — \`[label](https://example.com)\` — with the full \`https://\` scheme, every time, without exception. Never write a bare domain like example.com, and never put an address in backticks: inline code is not clickable. This applies even when the document itself wrote the address bare, and even mid-sentence or inside a table cell or list item.`;

export const GROQ_SYSTEM_MESSAGE = {
    role: "system",
    content: GROQ_SYSTEM_PROMPT,
} as const;

export const GROQ_BRIEF_ANALYSIS_PROMPT = `Read the attached document end to end, then brief the developer who has to build from it.

Write these sections in this order, each under a \`##\` heading, skipping any the document genuinely has nothing for:

## Summary
What is being asked for, in a few sentences.

## Pain points
The problems the client actually wants solved, including ones they only describe indirectly. Give each one its own \`###\` heading of a few words, then explain it in a paragraph underneath, pointing to what in the document indicates it. Never put the title and the explanation on the same line.

## Their questions, answered
Every question the client raised in the document. Put the question on its own line in bold, exactly as a question, then answer it in a new paragraph directly below. Where the document doesn't settle one, say so and say what would.

## Scope and requirements
The concrete things to build: pages, features, integrations, content, and any stated constraint on stack, budget, or timeline. Use a bulleted list, one requirement per bullet.

## Gaps and risks
What a developer would have to resolve before quoting or starting: missing decisions, contradictions, and assumptions the document leaves open. One \`###\` heading per item, explanation underneath.

Reproduce exact wording for anything that pins down scope, written inline as ordinary prose — never wrapped in quotation marks.`;

type GroqCreateParams = Parameters<typeof groq.chat.completions.create>[0];

export const GROQ_REQUEST_DEFAULTS = {
    model: GROQ_MODEL,
    max_tokens: GROQ_MAX_TOKENS,
    temperature: GROQ_TEMPERATURE,
    reasoning_effort: "medium",
} satisfies Partial<GroqCreateParams>;

export function groqApiKey() {
    return process.env.GROQ_API_KEY || undefined;
}

export function isGroqConfigured() {
    return Boolean(groqApiKey());
}

function createGroqClient() {
    return new Groq();
}

const globalForGroq = globalThis as unknown as {
    groq?: Groq;
};

const groq = globalForGroq.groq ?? createGroqClient();

if (process.env.NODE_ENV !== "production") {
    globalForGroq.groq = groq;
}

export { groq };

export type GroqAnswer =
    | { ok: true; text: string; truncated: boolean }
    | { ok: false; reason: "empty" };

export function readAnswer(completion: Groq.Chat.ChatCompletion): GroqAnswer {
    const choice = completion.choices[0];
    const text = choice?.message?.content?.trim() ?? "";

    if (!text) return { ok: false, reason: "empty" };

    return { ok: true, text, truncated: choice.finish_reason === "length" };
}

export function describeGroqError(error: unknown) {
    if (error instanceof Groq.AuthenticationError) {
        return "Quiro's Groq key is missing or invalid.";
    }

    if (error instanceof Groq.PermissionDeniedError) {
        return "Quiro's Groq key isn't allowed to use this model.";
    }

    if (error instanceof Groq.RateLimitError) {
        return "Groq is rate limiting us. Try that again in a moment.";
    }

    if (error instanceof Groq.APIConnectionError) {
        return "Couldn't reach Groq. Check your connection and try again.";
    }

    if (error instanceof Groq.APIError) {
        if (error.status === 413) {
            return "Those documents are too large for this model. Try fewer or shorter sources.";
        }

        return `Groq returned an error (${error.status ?? "unknown"}).`;
    }

    return "Something went wrong generating that answer.";
}
