import { requireApiContext } from "@/lib/api-session";
import { isPaidPlanId } from "@/lib/billing";
import { ensureStripeCustomer } from "@/lib/billing-store";
import { BILLING_ROUTE } from "@/lib/dashboard-nav";
import { BillingPeriod } from "@/lib/pricing";
import { getOrganizations, getServerSession } from "@/lib/session";
import {
    appUrl,
    getStripe,
    integrationIdentifier,
    isBillingConfigured,
    stripePriceId,
} from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const guard = await requireApiContext();
    if (!guard.ok) return guard.response;

    if (!isBillingConfigured()) {
        return NextResponse.json(
            { error: "Billing Isn't Configured On This Deployment." },
            { status: 503 },
        );
    }

    const body = (await request.json().catch(() => null)) as {
        plan?: string;
        period?: string;
    } | null;

    const plan = body?.plan ?? "";
    const period = (body?.period ?? "monthly") as BillingPeriod;

    if (!isPaidPlanId(plan)) {
        return NextResponse.json({ error: "Unknown Plan." }, { status: 400 });
    }

    if (period !== "monthly" && period !== "annual") {
        return NextResponse.json(
            { error: "Unknown Billing Period." },
            { status: 400 },
        );
    }

    const price = stripePriceId(plan, period);

    if (!price) {
        return NextResponse.json(
            { error: `No Stripe Price Is Configured For The ${plan} Plan.` },
            { status: 503 },
        );
    }

    const session = await getServerSession();
    const organizations = await getOrganizations();
    const organization = organizations.find(
        (candidate) => candidate.id === guard.context.organizationId,
    );

    if (!session || !organization) {
        return NextResponse.json({ error: "Not Signed In." }, { status: 401 });
    }

    const customer = await ensureStripeCustomer({
        organizationId: organization.id,
        organizationName: organization.name,
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
    });

    const checkout = await getStripe().checkout.sessions.create({
        mode: "subscription",
        customer,
        line_items: [{ price, quantity: 1 }],
        allow_promotion_codes: true,
        client_reference_id: organization.id,
        subscription_data: {
            metadata: {
                organizationId: organization.id,
                organizationName: organization.name,
                userId: session.user.id,
            },
        },
        metadata: { organizationId: organization.id, planId: plan },
        integration_identifier: integrationIdentifier(),
        success_url: appUrl(
            `${BILLING_ROUTE}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        ),
        cancel_url: appUrl(`${BILLING_ROUTE}?checkout=cancelled`),
    });

    if (!checkout.url) {
        return NextResponse.json(
            { error: "Stripe Didn't Return a Checkout URL." },
            { status: 502 },
        );
    }

    return NextResponse.json({ url: checkout.url });
}
