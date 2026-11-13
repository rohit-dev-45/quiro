import { Progress } from "@/components/ui/progress";
import { planName } from "@/lib/billing";
import { isUnlimited } from "@/lib/chat";
import { getWorkspaceStats } from "@/lib/chat-store";
import { BILLING_ROUTE } from "@/lib/dashboard-nav";
import { requireOrganization } from "@/lib/session";
import { cn } from "@/lib/utils";
import Link from "next/link";

function meterTone(ratio: number) {
    return ratio >= 1
        ? "**:data-[slot=progress-indicator]:bg-destructive"
        : "**:data-[slot=progress-indicator]:bg-brand";
}

function StatTile({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-5">
            <span className="text-sm text-muted-foreground">{label}</span>
            {children}
        </div>
    );
}

async function HomeStats() {
    const organization = await requireOrganization();
    const {
        documentsIndexed,
        documentsPending,
        questionsThisMonth,
        planId,
        questionLimit,
    } = await getWorkspaceStats(organization.id);

    const unlimited = isUnlimited(questionLimit);
    const ratio = unlimited ? 0 : questionsThisMonth / questionLimit;

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatTile label="Documents Indexed">
                <span className="text-3xl font-bold tracking-tight">
                    {documentsIndexed}
                </span>

                {documentsPending > 0 && (
                    <span className="text-sm text-muted-foreground">
                        {documentsPending} Still Being Read
                    </span>
                )}
            </StatTile>

            <StatTile label="Questions This Month">
                <span className="text-3xl font-bold tracking-tight">
                    {questionsThisMonth}
                    <span className="ml-1 text-lg font-normal text-muted-foreground">
                        {unlimited ? "This Month" : `/ ${questionLimit}`}
                    </span>
                </span>

                <Progress
                    value={Math.min(100, Math.round(ratio * 100))}
                    aria-label={
                        unlimited
                            ? `${questionsThisMonth} Questions Asked This Month, On An Unlimited Plan`
                            : `${questionsThisMonth} Of ${questionLimit} Questions Used This Month`
                    }
                    className={cn(
                        "mt-auto **:data-[slot=progress-track]:h-1.5 **:data-[slot=progress-track]:bg-brand/15",
                        "**:data-[slot=progress-indicator]:rounded-full",
                        meterTone(ratio),
                    )}
                />
            </StatTile>

            <StatTile label="Current plan">
                <span className="flex items-center gap-3">
                    <span className="text-3xl font-bold tracking-tight">
                        {planName(planId)}
                    </span>
                    <Link
                        href={BILLING_ROUTE}
                        className="rounded-md bg-brand/15 px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/25"
                    >
                        {planId === "free" ? "Upgrade" : "Manage"}
                    </Link>
                </span>
            </StatTile>
        </div>
    );
}

export { HomeStats };
