import { cache } from "react";
import type Stripe from "stripe";

import {
    isEntitled,
    planQuestionLimit,
    type BillingCard,
    type BillingInvoice,
    type BillingView,
    type PlanId,
} from "@/lib/billing";
import { db } from "@/lib/db";
import { getStripe, isBillingConfigured, planForPrice } from "@/lib/stripe";

const INVOICE_LIMIT = 5;

export const getSubscriptionRecord = cache(async (organizationId: string) => {
    return db.subscription.findUnique({ where: { organizationId } });
});

export const getWorkspacePlan = cache(
    async (organizationId: string): Promise<PlanId> => {
        const record = await getSubscriptionRecord(organizationId);

        if (!record || !isEntitled(record.status)) return "free";

        return record.planId as PlanId;
    },
);

export async function getWorkspaceQuestionLimit(organizationId: string) {
    return planQuestionLimit(await getWorkspacePlan(organizationId));
}

export async function ensureStripeCustomer({
    organizationId,
    organizationName,
    userId,
    email,
    name,
}: {
    organizationId: string;
    organizationName: string;
    userId: string;
    email: string;
    name?: string | null;
}) {
    const existing = await db.subscription.findUnique({
        where: { organizationId },
        select: { stripeCustomerId: true },
    });

    if (existing?.stripeCustomerId) return existing.stripeCustomerId;

    const customer = await getStripe().customers.create({
        email,
        name: name || organizationName,
        metadata: { organizationId, organizationName, userId },
    });

    const saved = await db.subscription.upsert({
        where: { organizationId },
        create: {
            organizationId,
            stripeCustomerId: customer.id,
            planId: "free",
        },
        update: { stripeCustomerId: customer.id },
    });

    return saved.stripeCustomerId!;
}

export async function grantPlan({
    organizationId,
    planId,
    grantedByUserId,
}: {
    organizationId: string;
    planId: PlanId;
    grantedByUserId: string;
}) {
    const data = {
        planId,
        status: "active",
        source: "admin",
        grantedByUserId,
        interval: null,
        priceId: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
    };

    return db.subscription.upsert({
        where: { organizationId },
        create: { organizationId, ...data },
        update: data,
    });
}

function currentPeriodEnd(subscription: Stripe.Subscription) {
    const seconds = subscription.items.data[0]?.current_period_end;

    return seconds ? new Date(seconds * 1000) : null;
}

function cardFrom(
    paymentMethod: string | Stripe.PaymentMethod | null | undefined,
) {
    if (!paymentMethod || typeof paymentMethod === "string") return null;

    const card = paymentMethod.card;

    if (!card) return null;

    return {
        brand: card.brand,
        last4: card.last4,
        expMonth: card.exp_month,
        expYear: card.exp_year,
    };
}

async function organizationForSubscription(subscription: Stripe.Subscription) {
    const fromMetadata = subscription.metadata?.organizationId;

    if (fromMetadata) return fromMetadata;

    const customerId =
        typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

    const record = await db.subscription.findUnique({
        where: { stripeCustomerId: customerId },
        select: { organizationId: true },
    });

    return record?.organizationId ?? null;
}

export async function syncSubscription(subscription: Stripe.Subscription) {
    const organizationId = await organizationForSubscription(subscription);

    if (!organizationId) return null;

    const customerId =
        typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

    const priceId = subscription.items.data[0]?.price?.id ?? null;
    const { planId, period } = planForPrice(priceId);
    const card = cardFrom(subscription.default_payment_method);

    const data = {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        source: "stripe",
        grantedByUserId: null,
        status: subscription.status,
        planId,
        priceId,
        interval: period,
        currentPeriodEnd: currentPeriodEnd(subscription),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        ...(card && {
            cardBrand: card.brand,
            cardLast4: card.last4,
            cardExpMonth: card.expMonth,
            cardExpYear: card.expYear,
        }),
    };

    return db.subscription.upsert({
        where: { organizationId },
        create: { organizationId, ...data },
        update: data,
    });
}

export async function syncSubscriptionById(subscriptionId: string) {
    const subscription = await getStripe().subscriptions.retrieve(
        subscriptionId,
        { expand: ["default_payment_method", "items.data.price"] },
    );

    return syncSubscription(subscription);
}

export async function reconcileCheckoutSession(
    sessionId: string,
    organizationId: string,
) {
    if (!isBillingConfigured()) return null;

    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "unpaid") return null;
    if (session.client_reference_id !== organizationId) return null;
    if (!session.subscription) return null;

    const subscriptionId =
        typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;

    return syncSubscriptionById(subscriptionId);
}

function formatAmount(amount: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
    }).format(amount / 100);
}

function invoiceStatus(invoice: Stripe.Invoice) {
    switch (invoice.status) {
        case "paid":
            return "Paid";
        case "open":
            return invoice.due_date && invoice.due_date * 1000 < Date.now()
                ? "Past due"
                : "Open";
        case "void":
            return "Void";
        case "uncollectible":
            return "Unpaid";
        default:
            return "Draft";
    }
}

async function listInvoices(customerId: string): Promise<BillingInvoice[]> {
    const invoices = await getStripe().invoices.list({
        customer: customerId,
        limit: INVOICE_LIMIT,
    });

    return invoices.data
        .filter((invoice) => invoice.status && invoice.status !== "draft")
        .map((invoice) => ({
            id: invoice.id ?? invoice.number ?? String(invoice.created),
            date: new Date(invoice.created * 1000).toISOString(),
            amount: formatAmount(
                invoice.status === "paid"
                    ? invoice.amount_paid
                    : invoice.amount_due,
                invoice.currency,
            ),
            status: invoiceStatus(invoice),
            pdfUrl: invoice.invoice_pdf ?? invoice.hosted_invoice_url ?? null,
        }));
}

export async function getBillingView(
    organizationId: string,
): Promise<BillingView> {
    const configured = isBillingConfigured();
    const record = await getSubscriptionRecord(organizationId);

    const entitled = isEntitled(record?.status);
    const card: BillingCard | null =
        record?.cardBrand && record.cardLast4
            ? {
                  brand: record.cardBrand,
                  last4: record.cardLast4,
                  expires:
                      record.cardExpMonth && record.cardExpYear
                          ? `${String(record.cardExpMonth).padStart(2, "0")}/${String(
                                record.cardExpYear,
                            ).slice(-2)}`
                          : null,
              }
            : null;

    let invoices: BillingInvoice[] = [];

    if (configured && record?.stripeCustomerId) {
        try {
            invoices = await listInvoices(record.stripeCustomerId);
        } catch (error) {
            console.error("[billing] could not list invoices", error);
        }
    }

    return {
        planId: entitled ? (record!.planId as PlanId) : "free",
        status: record?.status ?? null,
        period: (record?.interval as BillingView["period"]) ?? null,
        currentPeriodEnd: record?.currentPeriodEnd?.toISOString() ?? null,
        cancelAtPeriodEnd: record?.cancelAtPeriodEnd ?? false,
        source: (record?.source as BillingView["source"]) ?? "stripe",
        card,
        invoices,
        configured,
        hasCustomer: Boolean(record?.stripeCustomerId),
    };
}
