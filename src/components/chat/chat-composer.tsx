"use client";

import { ReactNode, useState } from "react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupTextarea,
} from "../ui/input-group";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "lucide-react";

const COMPOSER_TONES = {
    filled: "border-transparent bg-muted",
    outline: "bg-card",
};

function ChatComposer({
    placeholder,
    defaultValue = "",
    disabled = false,
    tone = "filled",
    footer,
    onSend,
    className,
}: {
    placeholder: string;
    defaultValue?: string;
    disabled?: boolean;
    tone?: keyof typeof COMPOSER_TONES;
    footer?: ReactNode;
    onSend?: (question: string) => void;
    className?: string;
}) {
    const [value, setValue] = useState(defaultValue);
    const canSend = !disabled && value.trim().length > 0;

    function send() {
        if (!canSend) return;

        onSend?.(value.trim());
        setValue("");
    }

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                send();
            }}
        >
            <InputGroup
                className={cn("rounded-2xl", COMPOSER_TONES[tone], className)}
            >
                <InputGroupTextarea
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            send();
                        }
                    }}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={1}
                    aria-label="Ask a question about your documents"
                    className="min-h-12 px-4 py-3.5"
                />

                {footer ? (
                    <InputGroupAddon align="block-end" className="gap-2 px-3">
                        {footer}
                        <SendButton canSend={canSend} tone={tone} />
                    </InputGroupAddon>
                ) : (
                    <InputGroupAddon align="inline-end" className="pr-3">
                        <SendButton canSend={canSend} tone={tone} />
                    </InputGroupAddon>
                )}
            </InputGroup>
        </form>
    );
}

function SendButton({
    canSend,
    tone,
}: {
    canSend: boolean;
    tone: keyof typeof COMPOSER_TONES;
}) {
    return (
        <InputGroupButton
            type="submit"
            size="icon-sm"
            variant={tone === "outline" ? "default" : "ghost"}
            disabled={!canSend}
            aria-label="Send question"
            className="cursor-pointer"
        >
            <ArrowRightIcon />
        </InputGroupButton>
    );
}

export { ChatComposer };
