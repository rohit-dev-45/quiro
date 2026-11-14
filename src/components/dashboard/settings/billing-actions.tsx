"use client";

import { BillingToggle } from "@/components/landing/billing-toggle";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { PaidPlanId, PlanId, planName } from "@/lib/billing";
import { BillingPeriod } from "@/lib/pricing";
import { useCallback, useState } from "react";

async function stripeUrl(path: string, body?: unknown) {
    const response = await fetch(path, {
        method: "POST",
        ...(body !== undefined && {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.url) {
        throw new Error(payload?.error ?? "Try Again In a Moment.");
    }

    return payload.url as string;
}

function useStripeRedirect() {
    const [pending, setPending] = useState<string | null>(null);

    const go = useCallback(async (id: string, path: string, body?: unknown) => {
        setPending(id);

        try {
            window.location.href = await stripeUrl(path, body);
        } catch (error) {
            setPending(null);
            toast.add({
                type: "error",
                title: "Couldn't Open Stripe.",
                description:
                    error instanceof Error
                        ? error.message
                        : "Try Again In a Moment.",
            });
        }
    }, []);

    return { pending, go };
}

function PlanActions({
    planId,
    hasCustomer,
    upgrades,
}: {
    planId: PlanId;
    hasCustomer: boolean;
    upgrades: PaidPlanId[];
}) {
    const [period, setPeriod] = useState<BillingPeriod>("monthly");
    const { pending, go } = useStripeRedirect();

    return (
        <div className="flex flex-wrap items-center gap-3">
            {upgrades.length > 0 && (
                <BillingToggle
                    className="mr-1"
                    value={period}
                    onValueChange={setPeriod}
                />
            )}

            {hasCustomer && (
                <Button
                    variant="outline"
                    size="lg"
                    className="cursor-pointer bg-background px-4"
                    disabled={pending !== null}
                    onClick={() => go("portal", "/api/billing/portal")}
                >
                    {pending === "portal" && <Spinner />}
                    {planId === "free" ? "Billing History" : "Manage Plan"}
                </Button>
            )}

            {upgrades.map((upgrade, index) => (
                <Button
                    key={upgrade}
                    variant={
                        index === upgrades.length - 1 ? "default" : "outline"
                    }
                    size="lg"
                    className={
                        index === upgrades.length - 1
                            ? "cursor-pointer px-4"
                            : "cursor-pointer bg-background px-4"
                    }
                    disabled={pending !== null}
                    onClick={() =>
                        go(upgrade, "/api/billing/checkout", {
                            plan: upgrade,
                            period,
                        })
                    }
                >
                    {pending === upgrade && <Spinner />}
                    {planId === "free" ? "Get " : "Upgrade To "}
                    {planName(upgrade)}
                </Button>
            ))}
        </div>
    );
}

function ManagePaymentMethodButton({
    hasCard,
    hasCustomer,
}: {
    hasCard: boolean;
    hasCustomer: boolean;
}) {
    const { pending, go } = useStripeRedirect();

    return (
        <Button
            variant="outline"
            size="lg"
            className="ml-auto cursor-pointer px-4"
            disabled={!hasCustomer || pending !== null}
            onClick={() => go("portal", "/api/billing/portal")}
        >
            {pending === "portal" && <Spinner />}
            {hasCard ? "Update" : "Add Card"}
        </Button>
    );
}

export { ManagePaymentMethodButton, PlanActions };
