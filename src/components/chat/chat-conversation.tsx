"use client";

import {
    allowanceSpentMessage,
    ChatDetail,
    ChatMessageView,
    chatRoute,
    ChatSource,
    formatQuestionCount,
} from "@/lib/chat";
import { ActiveCitation, SourceReader } from "./source-reader";
import {
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Bubble, BubbleContent } from "../ui/bubble";
import { AnswerMarkdown } from "./answer-markdown";
import { Separator } from "../ui/separator";
import {
    Message,
    MessageContent,
    MessageFooter,
    MessageHeader,
} from "../ui/message";
import { QuiroMark } from "../brand/docsy-logo";
import { AnswerActions } from "./answer-actions";
import { useRouter, useSearchParams } from "next/navigation";
import {
    MessageScroller,
    MessageScrollerButton,
    MessageScrollerContent,
    MessageScrollerItem,
    MessageScrollerProvider,
    MessageScrollerViewport,
} from "../ui/message-scroller";
import { TypingDots } from "../common/typing-dots";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ChatComposer } from "./chat-composer";
import { InputGroupButton } from "../ui/input-group";
import { PaperclipIcon } from "lucide-react";
import { DocumentScope } from "./document-scope";
import { cn } from "@/lib/utils";
import { AttachDocumentsDialog } from "./attach-documents-dialog";

function AnswerBody({
    content,
    sources,
    onSelectSource,
}: {
    content: string;
    sources: ChatSource[];
    onSelectSource?: (citation: ActiveCitation) => void;
}) {
    const selectByMarker = useMemo(() => {
        if (!onSelectSource) return undefined;

        return (index: number, passage: number | null) => {
            const source = sources.find(
                (candidate) => candidate.index === index,
            );
            if (source) onSelectSource({ source, passage });
        };
    }, [sources, onSelectSource]);

    return (
        <>
            <Bubble variant="ghost">
                <BubbleContent className="text-base">
                    <AnswerMarkdown onCitationSelect={selectByMarker}>
                        {content}
                    </AnswerMarkdown>
                </BubbleContent>
            </Bubble>

            {sources.length > 0 && (
                <>
                    <Separator />

                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[0.6875rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
                            Sources
                        </span>

                        {sources.map((source) => (
                            <button
                                key={source.index}
                                type="button"
                                onClick={() =>
                                    onSelectSource?.({ source, passage: 0 })
                                }
                                disabled={!onSelectSource}
                                className="flex cursor-pointer items-center gap-2 rounded-lg border bg-surface px-2.5 py-1.5 text-sm transition-colors hover:border-brand disabled:cursor-default disabled:hover:border-border"
                            >
                                <span className="font-mono text-xs font-semibold text-brand">
                                    [{source.index}]
                                </span>
                                {source.document}
                                {source.page !== null && ` · p.${source.page}`}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </>
    );
}

function AssistantTurn({
    children,
    actions,
}: {
    children: ReactNode;
    actions?: ReactNode;
}) {
    return (
        <Message align="start">
            <MessageContent className="gap-3">
                <MessageHeader className="gap-2 px-0">
                    <QuiroMark className="size-5" />
                    <span className="text-[0.6875rem] font-bold tracking-[0.08em] uppercase">
                        Quiro
                    </span>
                </MessageHeader>

                {children}

                {actions && (
                    <MessageFooter className="px-0">{actions}</MessageFooter>
                )}
            </MessageContent>
        </Message>
    );
}

function ChatTurn({
    message,
    chatId,
    onSelectSource,
}: {
    message: ChatMessageView;
    chatId: string;
    onSelectSource: (citation: ActiveCitation) => void;
}) {
    if (message.role === "user") {
        return (
            <Message align="end">
                <MessageContent>
                    <Bubble variant="muted" align="end">
                        <BubbleContent className="px-4 py-3">
                            {message.content}
                        </BubbleContent>
                    </Bubble>
                </MessageContent>
            </Message>
        );
    }

    return (
        <AssistantTurn
            actions={
                <AnswerActions
                    chatId={chatId}
                    messageId={message.id}
                    content={message.content}
                    feedback={message.feedback}
                />
            }
        >
            <AnswerBody
                content={message.content}
                sources={message.sources}
                onSelectSource={onSelectSource}
            />
        </AssistantTurn>
    );
}

function ChatConversation({ chat }: { chat: ChatDetail }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [carried] = useState(() => {
        const question = searchParams.get("q")?.trim() ?? "";

        return {
            question,
            autoAsk:
                question.length > 0 &&
                searchParams.get("ask") === "1" &&
                !chat.pendingAnswer,
        };
    });

    const [messages, setMessages] = useState<ChatMessageView[]>(() =>
        carried.autoAsk
            ? [
                  ...chat.messages,
                  {
                      id: "carried-question",
                      role: "user",
                      content: carried.question,
                      sources: [],
                      feedback: null,
                  },
              ]
            : chat.messages,
    );
    const [streamed, setStreamed] = useState("");
    const [isAnswering, setIsAnswering] = useState(
        chat.pendingAnswer || carried.autoAsk,
    );
    const [error, setError] = useState<string | null>(null);
    const [isAttachOpen, setIsAttachOpen] = useState(false);
    const [excluded, setExcluded] = useState<string[]>([]);

    const scope = chat.documents
        .map((document) => document.id)
        .filter((id) => !excluded.includes(id));

    const scopeKey = scope.join(",");

    const questionsAsked = (list: ChatMessageView[]) =>
        list.filter((message) => message.role === "user").length;

    const questionsThisMonth =
        chat.questionsThisMonth +
        Math.max(0, questionsAsked(messages) - questionsAsked(chat.messages));

    const allowanceSpent = questionsThisMonth >= chat.questionLimit;
    const [activeCitation, setActiveCitation] = useState<ActiveCitation | null>(
        () => {
            const source = [...chat.messages]
                .reverse()
                .find((message) => message.sources.length > 0)?.sources[0];

            return source ? { source, passage: 0 } : null;
        },
    );

    const requested = useRef(false);

    const answer = useCallback(
        async (question?: string) => {
            let text = "";

            try {
                const response = await fetch(`/api/chats/${chat.id}/messages`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...(question ? { question } : {}),
                        documentIds: scopeKey.split(","),
                    }),
                });

                if (!response.ok || !response.body) {
                    const detail = await response.json().catch(() => null);
                    setError(detail?.error ?? "Couldn't Reach Quiro.");
                    setIsAnswering(false);
                    return;
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() ?? "";

                    for (const line of lines) {
                        if (!line.trim()) continue;

                        const event = JSON.parse(line);

                        if (event.type === "text") {
                            text += event.value;
                            setStreamed(text);
                        }

                        if (event.type === "error") {
                            setStreamed("");
                            setError(event.value);
                            setIsAnswering(false);
                            return;
                        }

                        if (event.type === "done") {
                            setMessages((current) => [
                                ...current,
                                {
                                    id: event.messageId as string,
                                    role: "assistant",
                                    content: text,
                                    sources: event.sources as ChatSource[],
                                    feedback: null,
                                },
                            ]);
                            setStreamed("");
                            setIsAnswering(false);
                            const answered = event.sources as ChatSource[];
                            if (answered.length > 0) {
                                setActiveCitation({
                                    source: answered[0],
                                    passage: 0,
                                });
                            }
                            router.refresh();
                            return;
                        }
                    }
                }

                setError("The Answer Stopped Early. Ask Again To Retry.");
                setIsAnswering(false);
            } catch {
                setError("The Connection Dropped Before The Answer Finished.");
                setIsAnswering(false);
            }
        },
        [chat.id, router, scopeKey],
    );

    const outstanding = chat.pendingAnswer || carried.autoAsk;

    useEffect(() => {
        if (!outstanding || requested.current) return;

        requested.current = true;
        void answer(carried.autoAsk ? carried.question : undefined);

        if (carried.autoAsk) {
            window.history.replaceState(null, "", chatRoute(chat.id));
        }
    }, [outstanding, carried, answer, chat.id]);

    function ask(question: string) {
        setError(null);
        setMessages((current) => [
            ...current,
            {
                id: `question-${current.length}`,
                role: "user",
                content: question,
                sources: [],
                feedback: null,
            },
        ]);
        setIsAnswering(true);
        void answer(question);
    }

    return (
        <div className="flex min-h-0 flex-1">
            <div className="flex min-w-0 flex-1 flex-col">
                <MessageScrollerProvider autoScroll>
                    <MessageScroller className="flex-1">
                        <MessageScrollerViewport className="px-6 outline-none">
                            <MessageScrollerContent className="mx-auto w-full max-w-3xl py-8">
                                {messages.map((message) => (
                                    <MessageScrollerItem
                                        key={message.id}
                                        messageId={message.id}
                                        scrollAnchor={message.role === "user"}
                                    >
                                        <ChatTurn
                                            message={message}
                                            chatId={chat.id}
                                            onSelectSource={setActiveCitation}
                                        />
                                    </MessageScrollerItem>
                                ))}

                                {isAnswering && (
                                    <MessageScrollerItem messageId="answering">
                                        <AssistantTurn>
                                            {streamed ? (
                                                <AnswerBody
                                                    content={streamed}
                                                    sources={[]}
                                                />
                                            ) : (
                                                <Bubble variant="ghost">
                                                    <BubbleContent className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        Reading Your Document
                                                        <TypingDots />
                                                    </BubbleContent>
                                                </Bubble>
                                            )}
                                        </AssistantTurn>
                                    </MessageScrollerItem>
                                )}

                                {error && (
                                    <MessageScrollerItem messageId="error">
                                        <Alert variant="destructive">
                                            <AlertTitle>
                                                Quiro Couldn&apos;t Answer
                                            </AlertTitle>
                                            <AlertDescription>
                                                {error}
                                            </AlertDescription>
                                        </Alert>
                                    </MessageScrollerItem>
                                )}
                            </MessageScrollerContent>
                        </MessageScrollerViewport>

                        <MessageScrollerButton />
                    </MessageScroller>
                </MessageScrollerProvider>

                <div className="shrink-0 px-6 pb-4">
                    <div className="mx-auto w-full max-w-3xl">
                        <ChatComposer
                            tone="outline"
                            disabled={isAnswering || allowanceSpent}
                            onSend={ask}
                            defaultValue={
                                carried.autoAsk ? "" : carried.question
                            }
                            placeholder={
                                allowanceSpent
                                    ? allowanceSpentMessage(chat.questionLimit)
                                    : "Ask a Follow-Up About Your Documents…"
                            }
                            footer={
                                <>
                                    <InputGroupButton
                                        size="icon-sm"
                                        variant="ghost"
                                        className="cursor-pointer"
                                        aria-label="Attach a document"
                                        onClick={() => setIsAttachOpen(true)}
                                    >
                                        <PaperclipIcon />
                                    </InputGroupButton>

                                    <DocumentScope
                                        documents={chat.documents}
                                        selected={scope}
                                        onChange={(next) =>
                                            setExcluded(
                                                chat.documents
                                                    .map(
                                                        (document) =>
                                                            document.id,
                                                    )
                                                    .filter(
                                                        (id) =>
                                                            !next.includes(id),
                                                    ),
                                            )
                                        }
                                        disabled={isAnswering}
                                    />

                                    <span
                                        className={cn(
                                            "ml-auto font-mono text-xs text-muted-foreground",
                                            allowanceSpent &&
                                                "text-destructive",
                                        )}
                                    >
                                        {formatQuestionCount(
                                            questionsThisMonth,
                                            chat.questionLimit,
                                        )}
                                    </span>
                                </>
                            }
                        />

                        <p className="mt-2 text-center text-xs text-muted-foreground">
                            Quiro Answers Only From Your Documents And Cites
                            Every Claim.
                        </p>
                    </div>
                </div>
            </div>

            <SourceReader
                citation={activeCitation}
                onDismiss={() => setActiveCitation(null)}
            />

            <AttachDocumentsDialog
                chatId={chat.id}
                attachedIds={chat.documents.map((document) => document.id)}
                open={isAttachOpen}
                onOpenChange={setIsAttachOpen}
            />
        </div>
    );
}

export { ChatConversation };
