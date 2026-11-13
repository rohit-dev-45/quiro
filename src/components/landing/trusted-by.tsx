import { cn } from "@/lib/utils";

const COMPANIES = [
    "Northwind Legal",
    "Meridian Capital",
    "Atlas Research",
    "Vertex Ops",
    "Harbor & Co.",
];

export function TrustedBy({ className }: { className?: string }) {
    return (
        <div className={cn("flex flex-col items-center gap-6", className)}>
            <p className="text-center font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
                Trusted Where The Answer Has To Be Right
            </p>
            <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
                {COMPANIES.map((company) => (
                    <li
                        key={company}
                        className="font-medium tracking-wide text-muted-foreground uppercase"
                    >
                        {company}
                    </li>
                ))}
            </ul>
        </div>
    );
}
