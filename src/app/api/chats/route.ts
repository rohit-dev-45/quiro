import { requireApiContext } from "@/lib/api-session";
import { MAX_DOCUMENTS_PER_CHAT } from "@/lib/chat";
import { clearChats, createChat, readyDocumentIds } from "@/lib/chat-store";
import { GROQ_BRIEF_ANALYSIS_PROMPT } from "@/lib/groq";
import { NextResponse } from "next/server";

function titleFromDocument(name: string) {
    const withoutExtension = name.replace(/\.[^.]+$/, "");
    const spaced = withoutExtension.replace(/[_-]+/g, " ").trim();

    return spaced.slice(0, 120) || "Untitled Document";
}

export async function POST(request: Request) {
    const guard = await requireApiContext();
    if (!guard.ok) return guard.response;

    let body: { documentIds?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
    }

    const requestedIds = Array.isArray(body.documentIds)
        ? body.documentIds.filter((id): id is string => typeof id === "string")
        : [];

    if (requestedIds.length === 0) {
        return NextResponse.json(
            { error: "Add At Least One Document To Start a Chat." },
            { status: 400 },
        );
    }

    if (requestedIds.length > MAX_DOCUMENTS_PER_CHAT) {
        return NextResponse.json(
            {
                error: `A Chat Can Hold At Most ${MAX_DOCUMENTS_PER_CHAT} Documents.`,
            },
            { status: 400 },
        );
    }

    const documents = await readyDocumentIds(
        requestedIds,
        guard.context.organizationId,
    );

    if (documents.length !== requestedIds.length) {
        return NextResponse.json(
            { error: "Some Of Those Documents Aren't Available." },
            { status: 400 },
        );
    }

    const ordered = requestedIds.map((id) =>
        documents.find((document) => document.id === id)!,
    );

    const chat = await createChat({
        organizationId: guard.context.organizationId,
        userId: guard.context.userId,
        documentIds: ordered.map((document) => document.id),
        title: titleFromDocument(ordered[0].name),
        seedPrompt: GROQ_BRIEF_ANALYSIS_PROMPT,
    });

    return NextResponse.json({ id: chat.id }, { status: 201 });
}

export async function DELETE() {
    const guard = await requireApiContext();
    if (!guard.ok) return guard.response;

    const chats = await clearChats(guard.context.organizationId);

    return NextResponse.json({ chats });
}
