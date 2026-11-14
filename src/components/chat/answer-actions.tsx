"use client";

import { MessageFeedbackView } from "@/lib/chat";
import { useState } from "react";
import { toast } from "../ui/toast";
import { Button } from "../ui/button";
import {
    CheckIcon,
    CopyIcon,
    ThumbsDownIcon,
    ThumbsUpIcon,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

function AnswerActions({
    chatId,
    messageId,
    content,
    feedback: initialFeedback,
}: {
    chatId: string;
    messageId: string;
    content: string;
    feedback: MessageFeedbackView;
}) {
    const [copied, setCopied] = useState(false);
    const [feedback, setFeedback] = useState(initialFeedback);

    async function copy() {
        try {
            await navigator.clipboard.writeText(
                content.replace(/\[(\d+):\d+\]/g, "[$1]"),
            );
            setCopied(true);
            toast.add({ title: "Answer Copied To Your Clipboard." });
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.add({
                title: "Couldn't Copy That.",
                description: "Your Browser Blocked Clipboard Access.",
            });
        }
    }

    async function rate(next: MessageFeedbackView) {
        const previous = feedback;

        setFeedback(next);

        try {
            const response = await fetch(
                `/api/chats/${chatId}/messages/${messageId}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ feedback: next }),
                },
            );

            if (!response.ok) throw new Error("Request Failed");

            toast.add({
                title:
                    next === null
                        ? "Feedback Cleared."
                        : next === "UP"
                          ? "Thanks — Glad That Was Useful."
                          : "Thanks — We'll Use This To Improve Answers.",
            });
        } catch {
            setFeedback(previous);
            toast.add({
                title: "Couldn't Save That Feedback.",
                description: "Check Your Connection And Try Again.",
            });
        }
    }

    return (
        <div className="flex items-center gap-1">
            <Button
                variant="outline"
                size="icon-sm"
                className="cursor-pointer"
                aria-label="Copy answer"
                onClick={copy}
            >
                {copied ? <CheckIcon /> : <CopyIcon />}
            </Button>

            <ToggleGroup
                variant="outline"
                size="sm"
                spacing={1}
                value={feedback ? [feedback] : []}
                onValueChange={(value: string[]) =>
                    void rate((value[0] as MessageFeedbackView) ?? null)
                }
            >
                <ToggleGroupItem
                    value="UP"
                    aria-label="This answer was helpful"
                    className="cursor-pointer"
                >
                    <ThumbsUpIcon />
                </ToggleGroupItem>

                <ToggleGroupItem
                    value="DOWN"
                    aria-label="This answer was not helpful"
                    className="cursor-pointer"
                >
                    <ThumbsDownIcon />
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    );
}

export { AnswerActions };
