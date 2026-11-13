import { PLANS, type BillingPeriod } from "@/lib/pricing";

export type PlanId = "free" | "pro" | "business";

export const PAID_PLAN_IDS = ["pro", "business"] as const;

export type PaidPlanId = (typeof PAID_PLAN_IDS)[number];

export function isPaidPlanId(value: string): value is PaidPlanId {
    return (PAID_PLAN_IDS as readonly string[]).includes(value);
}

export const ENTITLED_STATUSES = ["active", "trialing"] as const;

const ENTITLED_STATUS_SET: ReadonlySet<string> = new Set(ENTITLED_STATUSES);

export function isEntitled(status: string | null | undefined) {
    return (
        status !== null &&
        status !== undefined &&
        ENTITLED_STATUS_SET.has(status)
    );
}

export const PLAN_QUESTION_LIMITS: Record<PlanId, number> = {
    free: 5,
    pro: 50,
    business: Number.POSITIVE_INFINITY,
};

export function planQuestionLimit(planId: PlanId) {
    return PLAN_QUESTION_LIMITS[planId];
}

export function planCatalogEntry(planId: PlanId) {
    return PLANS.find((plan) => plan.id === planId) ?? PLANS[0];
}

export function planName(planId: PlanId) {
    return planCatalogEntry(planId).name;
}

export function planLabel(planId: PlanId) {
    return `${planName(planId)} Plan`;
}

export function nextPlanUp(planId: PlanId): PaidPlanId | null {
    if (planId === "free") return "pro";
    if (planId === "pro") return "business";

    return null;
}

export type BillingSource = "stripe" | "admin";

export function isAdminGranted(source: string | null | undefined) {
    return source === "admin";
}

export type BillingCard = {
    brand: string;
    last4: string;
    expires: string | null;
};

export type BillingInvoice = {
    id: string;
    date: string;
    amount: string;
    status: string;
    pdfUrl: string | null;
};

export type BillingView = {
    planId: PlanId;
    status: string | null;
    period: BillingPeriod | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    source: BillingSource;
    card: BillingCard | null;
    invoices: BillingInvoice[];
    configured: boolean;
    hasCustomer: boolean;
};

export function formatBillingDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function planTerms(view: BillingView) {
    const plan = planCatalogEntry(view.planId);

    if (isAdminGranted(view.source) && view.planId !== "free") {
        return "Granted By An Admin · No Payment On File";
    }

    if (view.planId === "free") {
        return `${PLAN_QUESTION_LIMITS.free} Questions Per Month · Upgrade Any Time`;
    }

    const period = view.period ?? "monthly";
    const price = `$${plan.price[period]} / month`;
    const billed = period === "annual" ? ", Billed Annually" : "";

    if (!view.currentPeriodEnd) return `${price}${billed}`;

    const date = formatBillingDate(view.currentPeriodEnd);

    return view.cancelAtPeriodEnd
        ? `${price}${billed} · Ends ${date}`
        : `${price}${billed} · Renews ${date}`;
}

export function billingWarning(view: BillingView) {
    if (isEntitled(view.status)) return null;

    switch (view.status) {
        case "past_due":
        case "unpaid":
            return "Your Last Payment Failed, So This Workspace Is Back On Free Limits. Update Your Payment Method To Restore Your Plan.";
        case "incomplete":
            return "Your Payment Hasn't Finished Confirming Yet. Your Plan Starts As Soon As It Does.";
        case "incomplete_expired":
            return "That Checkout Expired Before The Payment Confirmed, So No Plan Was Started.";
        case "canceled":
            return "Your Subscription Was Cancelled. You're On Free Limits Now.";
        default:
            return null;
    }
}
