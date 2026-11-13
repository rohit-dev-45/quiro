import { cn } from "@/lib/utils";

function SpinnerRing({ className, ...props }: React.ComponentProps<"span">) {
    return (
        <span
            role="status"
            aria-label="Loading"
            className={cn(
                "size-4 shrink-0 animate-spin rounded-full border-2 border-current/25 border-t-current",
                className,
            )}
            {...props}
        />
    );
}

export { SpinnerRing };
