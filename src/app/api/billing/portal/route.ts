import { requireApiContext } from "@/lib/api-session";
import { getSubscriptionRecord } from "@/lib/billing-store";
import { BILLING_ROUTE } from "@/lib/dashboard-nav";
import { appUrl, getStripe, isBillingConfigured } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST() {
    const guard = await requireApiContext();
    if (!guard.ok) return guard.response;

    if (!isBillingConfigured()) {
        return NextResponse.json(
            { error: "Billing Isn't Configured On This Deployment." },
            { status: 503 },
        );
    }

    const record = await getSubscriptionRecord(guard.context.organizationId);

    if (!record?.stripeCustomerId) {
        return NextResponse.json(
            { error: "This Workspace Has No Billing History Yet." },
            { status: 400 },
        );
    }

    const session = await getStripe().billingPortal.sessions.create({
        customer: record.stripeCustomerId,
        return_url: appUrl(BILLING_ROUTE),
    });

    return NextResponse.json({ url: session.url });
}
