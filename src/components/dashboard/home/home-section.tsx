import Link from "next/link";

function HomeSection({
    title,
    action,
    children,
}: {
    title: string;
    action?: { href: string; label: string };
    children: React.ReactNode;
}) {
    return (
        <section className="min-w-0">
            <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-semibold">{title}</h3>

                {action && (
                    <Link
                        href={action.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {action.label}
                    </Link>
                )}
            </div>

            <div className="mt-4 divide-y overflow-hidden rounded-xl border bg-card">
                {children}
            </div>
        </section>
    );
}

export { HomeSection };
