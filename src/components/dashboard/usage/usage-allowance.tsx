import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { isUnlimited } from "@/lib/chat";
import { BILLING_ROUTE } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

function meterTone(ratio: number) {
    return ratio >= 1
        ? "**:data-[slot=progress-indicator]:bg-destructive"
        : "**:data-[slot=progress-indicator]:bg-brand";
}

function UsageAllowance({
    questions,
    limit,
}: {
    questions: number;
    limit: number;
}) {
    const unlimited = isUnlimited(limit);
    const ratio = unlimited ? 0 : questions / limit;
    const percent = Math.min(100, Math.round(ratio * 100));
    const remaining = Math.max(0, limit - questions);

    return (
        <div className="rounded-xl border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-muted-foreground">
                        Questions This Month
                    </p>

                    <p className="mt-1 text-4xl font-bold tracking-tight">
                        {questions}
                        <span className="ml-1.5 text-lg font-normal text-muted-foreground">
                            {unlimited ? "Of Unlimited" : `/ ${limit}`}
                        </span>
                    </p>
                </div>

                <Button
                    variant="outline"
                    size="lg"
                    nativeButton={false}
                    className="cursor-pointer"
                    render={<Link href={BILLING_ROUTE} />}
                >
                    {unlimited ? "Manage Plan" : "Upgrade For More"}
                    <ArrowRightIcon data-icon="inline-end" />
                </Button>
            </div>

            <Progress
                value={percent}
                aria-label={
                    unlimited
                        ? `${questions} Questions Asked This Month, On An Unlimited Plan`
                        : `${questions} Of ${limit} Questions Used This Month`
                }
                className={cn(
                    "mt-4 **:data-[slot=progress-track]:h-2 **:data-[slot=progress-track]:bg-brand/15",
                    "**:data-[slot=progress-indicator]:rounded-full",
                    meterTone(ratio),
                )}
            />

            <div className="mt-2 flex items-center justify-between font-mono text-sm text-muted-foreground">
                <span>
                    {unlimited
                        ? "Unlimited Questions On This Plan"
                        : remaining === 0
                          ? "No Questions Remaining"
                          : `${remaining} ${remaining === 1 ? "Question" : "Questions"} Remaining`}
                </span>
                <span>{unlimited ? "" : `${percent}%`}</span>
            </div>
        </div>
    );
}

export { UsageAllowance };
