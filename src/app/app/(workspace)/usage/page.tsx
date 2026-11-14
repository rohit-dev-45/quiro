import { UsageAllowance } from "@/components/dashboard/usage/usage-allowance";
import { UsageChart } from "@/components/dashboard/usage/usage-chart";
import { UsageDocuments } from "@/components/dashboard/usage/usage-documents";
import { getUsage } from "@/lib/chat-store";
import { requireOrganization } from "@/lib/session";
import { formatDuration, formatPeriod, USAGE_CHART_DAYS } from "@/lib/usage";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Usage",
};

function StatTile({
    label,
    value,
    suffix,
}: {
    label: string;
    value: string;
    suffix?: string;
}) {
    return (
        <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">
                {value}
                {suffix && (
                    <span className="ml-1.5 text-base font-normal text-muted-foreground">
                        {suffix}
                    </span>
                )}
            </p>
        </div>
    );
}

function Panel({
    title,
    aside,
    children,
    bodyClassName,
}: {
    title: string;
    aside?: string;
    children: React.ReactNode;
    bodyClassName?: string;
}) {
    return (
        <section className="rounded-xl border bg-card">
            <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4">
                <h3 className="font-heading font-bold tracking-tight">
                    {title}
                </h3>
                {aside && (
                    <span className="font-mono text-xs text-muted-foreground">
                        {aside}
                    </span>
                )}
            </div>

            <div className={bodyClassName}>{children}</div>
        </section>
    );
}

const UsagePage = async () => {
    const organization = await requireOrganization();
    const usage = await getUsage(organization.id);

    return (
        <div className="mx-auto w-full max-w-4xl px-6 py-10">
            <h2 className="font-heading text-3xl font-bold tracking-tight">
                Usage
            </h2>
            <p className="mt-2 text-muted-foreground">
                Allowance Period {formatPeriod(usage.period)} ·{" "}
                {usage.period.resetsInDays === 0
                    ? "Resets Today."
                    : `Resets In ${usage.period.resetsInDays} ${usage.period.resetsInDays === 1 ? "Day" : "Days"}.`}
            </p>

            <div className="mt-6 flex flex-col gap-4">
                <UsageAllowance
                    questions={usage.questions}
                    limit={usage.questionLimit}
                />

                <div className="grid gap-4 sm:grid-cols-3">
                    <StatTile
                        label="Documents Indexed"
                        value={String(usage.documentsIndexed)}
                        suffix="/ Unlimited"
                    />
                    <StatTile
                        label="Citations Verified"
                        value={String(usage.citations)}
                    />
                    <StatTile
                        label="Avg. Answer Time"
                        value={
                            usage.averageAnswerSeconds === null
                                ? "—"
                                : formatDuration(usage.averageAnswerSeconds)
                        }
                    />
                </div>

                <Panel
                    title="Questions Per Day"
                    aside={`last ${USAGE_CHART_DAYS} Days`}
                    bodyClassName="px-5 pb-5"
                >
                    <UsageChart days={usage.days} />
                </Panel>

                <Panel
                    title="Most-Questioned Documents"
                    bodyClassName="border-t"
                >
                    <UsageDocuments documents={usage.documents} />
                </Panel>
            </div>
        </div>
    );
};

export default UsagePage;
