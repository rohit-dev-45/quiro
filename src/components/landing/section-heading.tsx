import { cn } from "@/lib/utils";

const TITLE_SIZES = {
    default: "text-3xl sm:text-4xl lg:text-[2.5rem]",
    sm: "text-2xl sm:text-3xl lg:text-4xl",
};

const DESCRIPTION_SIZES = {
    default: "text-lg",
    sm: "text-base",
};

export function SectionHeading({
    eyebrow,
    title,
    description,
    size = "default",
    className,
}: {
    eyebrow: string;
    title: React.ReactNode;
    description?: React.ReactNode;
    size?: keyof typeof TITLE_SIZES;
    className?: string;
}) {
    return (
        <div className={cn("flex flex-col gap-4", className)}>
            <p className="font-mono text-xs font-bold tracking-[0.18em] text-brand uppercase">
                {eyebrow}
            </p>
            <h2
                className={cn(
                    "leading-[1.15] font-bold tracking-tight",
                    TITLE_SIZES[size],
                )}
            >
                {title}
            </h2>
            {description ? (
                <p
                    className={cn(
                        "leading-relaxed text-muted-foreground",
                        DESCRIPTION_SIZES[size],
                    )}
                >
                    {description}
                </p>
            ) : null}
        </div>
    );
}
