import {
    billingWarning,
    formatBillingDate,
    nextPlanUp,
    PaidPlanId,
    PlanId,
    planName,
    planTerms,
} from "@/lib/billing";
import { getBillingView } from "@/lib/billing-store";
import { requireOrganization } from "@/lib/session";
import { ManagePaymentMethodButton, PlanActions } from "./billing-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function upgradesFrom(planId: PlanId) {
    const upgrades: PaidPlanId[] = [];

    for (let next = nextPlanUp(planId); next; next = nextPlanUp(next)) {
        upgrades.push(next);
    }

    return upgrades;
}

async function BillingSettings({ checkout }: { checkout?: string }) {
    const organization = await requireOrganization();
    const view = await getBillingView(organization.id);

    const upgrades = upgradesFrom(view.planId);
    const warning = billingWarning(view);
    const awaitingPayment = checkout === "success" && view.planId === "free";

    return (
        <div className="flex flex-col gap-6">
            {!view.configured && (
                <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                    Billing Isn't Configured On This Deployment Yet. Add Your
                    Stripe Keys And Price IDs To <code>.env</code> To Turn
                    Checkout On.
                </p>
            )}

            {awaitingPayment && (
                <p className="rounded-xl border border-brand bg-brand/10 p-4 text-sm">
                    Thanks — Your Payment Is Still Confirming With Your Bank.
                    Your Plan Starts The Moment It Clears, And You Don't Need To
                    Pay Again.
                </p>
            )}

            {checkout === "cancelled" && (
                <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                    Checkout Was Cancelled, So Nothing Was Charged And Your Plan
                    Hasn't Changed.
                </p>
            )}

            {warning && (
                <p className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm">
                    {warning}
                </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand bg-brand/10 p-6">
                <div>
                    <p className="font-semibold">
                        {planName(view.planId)} plan
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {planTerms(view)}
                    </p>
                </div>

                {view.configured && (
                    <PlanActions
                        planId={view.planId}
                        hasCustomer={view.hasCustomer}
                        upgrades={upgrades}
                    />
                )}
            </div>

            <Card className="[--card-spacing:--spacing(6)]">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                        Payment Method
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-wrap items-center gap-3">
                    {view.card ? (
                        <>
                            <span className="rounded-md border bg-muted px-2 py-1 text-[0.625rem] font-bold tracking-wider uppercase">
                                {view.card.brand}
                            </span>
                            <span className="text-sm">
                                <span aria-hidden>•••• </span>
                                <span className="sr-only">Card Ending In </span>
                                <span className="font-medium">
                                    {view.card.last4}
                                </span>
                                {view.card.expires && (
                                    <span className="text-muted-foreground">
                                        {" "}
                                        · Expires {view.card.expires}
                                    </span>
                                )}
                            </span>
                        </>
                    ) : (
                        <span className="text-sm text-muted-foreground">
                            No Card On File. You&apos;ll Add One When You Pick a
                            Plan.
                        </span>
                    )}

                    <ManagePaymentMethodButton
                        hasCard={Boolean(view.card)}
                        hasCustomer={view.hasCustomer}
                    />
                </CardContent>
            </Card>

            <Card className="gap-0 [--card-spacing:--spacing(6)]">
                <CardHeader className="pb-6">
                    <CardTitle className="text-lg font-semibold">
                        Invoices
                    </CardTitle>
                </CardHeader>

                <div className="divide-y border-t">
                    {view.invoices.length === 0 ? (
                        <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                            No Invoices Yet. They Appear Here After Your First
                            Payment.
                        </p>
                    ) : (
                        view.invoices.map((invoice) => (
                            <div
                                key={invoice.id}
                                className="flex items-center gap-4 px-6 py-4 text-sm"
                            >
                                <span className="flex-1">
                                    {formatBillingDate(invoice.date)}
                                </span>
                                <span className="text-muted-foreground tabular-nums">
                                    {invoice.amount}
                                </span>
                                <span className="rounded-md bg-brand/15 px-2 py-0.5 text-[0.625rem] font-bold tracking-wider text-brand uppercase">
                                    {invoice.status}
                                </span>

                                {invoice.pdfUrl ? (
                                    <a
                                        href={invoice.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="cursor-pointer text-sm transition-colors hover:text-brand"
                                    >
                                        Download
                                        <span className="sr-only">
                                            {" "}
                                            Invoice For{" "}
                                            {formatBillingDate(invoice.date)}
                                        </span>
                                    </a>
                                ) : (
                                    <span className="text-sm text-muted-foreground">
                                        —
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
}

export { BillingSettings };
