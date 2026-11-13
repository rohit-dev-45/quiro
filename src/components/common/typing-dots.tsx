import { cn } from "@/lib/utils";

const DELAYS = [
    "[animation-delay:0ms]",
    "[animation-delay:200ms]",
    "[animation-delay:400ms]",
];

export function TypingDots({
    className,
    label = "Quiro Is Typing",
}: {
    className?: string;
    label?: string;
}) {
    return (
        <span
            role="status"
            aria-label={label}
            className={cn("inline-flex items-center gap-1", className)}
        >
            {DELAYS.map((delay) => (
                <span
                    key={delay}
                    className={cn(
                        "size-1.5 animate-typing-dot rounded-full bg-muted-foreground motion-reduce:animate-none",
                        delay,
                    )}
                />
            ))}
        </span>
    );
}
