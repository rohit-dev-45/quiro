import Stripe from "stripe";

import { isPaidPlanId, type PaidPlanId, type PlanId } from "@/lib/billing";
import type { BillingPeriod } from "@/lib/pricing";

const PRICE_ENV_VARS: Record<PaidPlanId, Record<BillingPeriod, string>> = {
    pro: {
        monthly: "STRIPE_PRICE_PRO_MONTHLY",
        annual: "STRIPE_PRICE_PRO_ANNUAL",
    },
    business: {
        monthly: "STRIPE_PRICE_BUSINESS_MONTHLY",
        annual: "STRIPE_PRICE_BUSINESS_ANNUAL",
    },
};

const globalForStripe = globalThis as unknown as { stripe?: Stripe };

function createClient() {
    const key = process.env.STRIPE_SECRET_KEY;

    if (!key) {
        throw new Error(
            "STRIPE_SECRET_KEY is not set. Billing is disabled until it is — see .env.example.",
        );
    }

    //@ts-ignore
    return new Stripe(key, { apiVersion: "2026-07-29.dahlia" });
}

export function getStripe() {
    return (globalForStripe.stripe ??= createClient());
}

export function isBillingConfigured() {
    if (!process.env.STRIPE_SECRET_KEY) return false;

    return Object.values(PRICE_ENV_VARS).some((periods) =>
        Object.values(periods).some((name) => Boolean(process.env[name])),
    );
}

export function stripePriceId(planId: PaidPlanId, period: BillingPeriod) {
    return process.env[PRICE_ENV_VARS[planId][period]] || null;
}

export function planForPrice(priceId: string | null | undefined): {
    planId: PlanId;
    period: BillingPeriod | null;
} {
    if (!priceId) return { planId: "free", period: null };

    for (const [planId, periods] of Object.entries(PRICE_ENV_VARS)) {
        for (const [period, envVar] of Object.entries(periods)) {
            if (process.env[envVar] === priceId && isPaidPlanId(planId)) {
                return { planId, period: period as BillingPeriod };
            }
        }
    }

    return { planId: "free", period: null };
}

export function appUrl(path = "") {
    const base =
        process.env.NEXT_PUBLIC_APP_URL ??
        process.env.BETTER_AUTH_URL ??
        "http://localhost:3000";

    return `${base.replace(/\/$/, "")}${path}`;
}

export function integrationIdentifier() {
    return "docsy-billing-qkzvhtwm";
}
