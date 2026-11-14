import { NextResponse } from "next/server";

import { isGroqConfigured } from "@/lib/groq";
import { requireApiContext } from "@/lib/api-session";
import { streamAnswer } from "@/lib/answer";
import { allowanceSpentMessage, type ChatSource } from "@/lib/chat";
import {
    addMessage,
    getChat,
    getChatDocuments,
    getChatHistory,
    getQuestionAllowance,
    recordQuestion,
} from "@/lib/chat-store";

export const maxDuration = 300;

export async function POST(
    request: Request,
    { params }: { params: Promise<{ chatId: string }> },
) {
    const guard = await requireApiContext();
    if (!guard.ok) return guard.response;

    if (!isGroqConfigured()) {
        return NextResponse.json(
            { error: "GROQ_API_KEY Isn't Set, So Quiro Can't Answer Yet." },
            { status: 503 },
        );
    }

    const { chatId } = await params;
    const chat = await getChat(chatId, guard.context.organizationId);

    if (!chat) {
        return NextResponse.json({ error: "Chat Not Found." }, { status: 404 });
    }

    let body: { question?: unknown; documentIds?: unknown } = {};
    try {
        body = await request.json();
    } catch {}

    const question =
        typeof body.question === "string" ? body.question.trim() : undefined;

    if (question) {
        const allowance = await getQuestionAllowance(
            guard.context.organizationId,
        );

        if (allowance.spent) {
            return NextResponse.json(
                { error: allowanceSpentMessage(allowance.limit) },
                { status: 402 },
            );
        }

        await addMessage({ chatId, role: "USER", content: question });
    } else if (!chat.pendingAnswer) {
        return NextResponse.json(
            { error: "That Chat Has Nothing Waiting On An Answer." },
            { status: 409 },
        );
    }

    const [attached, history] = await Promise.all([
        getChatDocuments(chatId),
        getChatHistory(chatId),
    ]);

    if (attached.length === 0) {
        return NextResponse.json(
            { error: "That Chat Has No Documents To Read." },
            { status: 409 },
        );
    }

    const scope = Array.isArray(body.documentIds)
        ? body.documentIds.filter((id): id is string => typeof id === "string")
        : null;

    const documents =
        scope === null
            ? attached
            : attached.filter((document) => scope.includes(document.id));

    if (documents.length === 0) {
        return NextResponse.json(
            { error: "None Of Those Documents Belong To This Chat." },
            { status: 400 },
        );
    }

    if (question) {
        await recordQuestion({
            organizationId: guard.context.organizationId,
            userId: guard.context.userId,
            chatId,
        });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            const send = (event: unknown) =>
                controller.enqueue(
                    encoder.encode(`${JSON.stringify(event)}\n`),
                );

            let answer = "";

            try {
                for await (const event of streamAnswer(documents, history)) {
                    if (event.type === "text") {
                        answer += event.value;
                        send(event);
                        continue;
                    }

                    if (event.type === "error") {
                        send(event);
                        return;
                    }

                    if (!answer.trim()) {
                        send({
                            type: "error",
                            value: "Groq Returned An Empty Answer.",
                        });
                        return;
                    }

                    const saved = await addMessage({
                        chatId,
                        role: "ASSISTANT",
                        content: answer,
                        sources: event.sources as ChatSource[],
                    });

                    send({
                        type: "done",
                        sources: event.sources,
                        messageId: saved.id,
                    });
                }
            } catch (error) {
                console.error("[chat] Streaming Failed", error);
                send({
                    type: "error",
                    value: "The Answer Stopped Unexpectedly.",
                });
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "application/x-ndjson; charset=utf-8",
            "Cache-Control": "no-store",
        },
    });
}
