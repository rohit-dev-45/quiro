import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { syncSubscriptionById } from "@/lib/billing-store";
import { getStripe, isBillingConfigured } from "@/lib/stripe";

const HANDLED_EVENTS = new Set<Stripe.Event["type"]>([
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.async_payment_failed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.paid",
    "invoice.payment_failed",
]);

function subscriptionIdFrom(
    value: string | Stripe.Subscription | null | undefined,
) {
    if (!value) return null;

    return typeof value === "string" ? value : value.id;
}

export async function POST(request: Request) {
    if (!isBillingConfigured()) {
        return NextResponse.json({ error: "Billing Is Off." }, { status: 503 });
    }

    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secret) {
        console.error("[stripe] STRIPE_WEBHOOK_SECRET Is Not Set");

        return NextResponse.json(
            { error: "Webhook Secret Is Not Configured." },
            { status: 503 },
        );
    }

    const signature = request.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "No Signature." }, { status: 400 });
    }

    const payload = await request.text();

    let event: Stripe.Event;

    try {
        event = await getStripe().webhooks.constructEventAsync(
            payload,
            signature,
            secret,
        );
    } catch (error) {
        console.error("[stripe] Signature Verification Failed", error);

        return NextResponse.json(
            { error: "Invalid Signature." },
            { status: 400 },
        );
    }

    if (!HANDLED_EVENTS.has(event.type)) {
        return NextResponse.json({ received: true, handled: false });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed":
            case "checkout.session.async_payment_succeeded":
            case "checkout.session.async_payment_failed": {
                const session = event.data.object;

                if (session.payment_status === "unpaid") break;

                const subscriptionId = subscriptionIdFrom(session.subscription);

                if (subscriptionId) await syncSubscriptionById(subscriptionId);

                break;
            }

            case "customer.subscription.created":
            case "customer.subscription.updated":
            case "customer.subscription.deleted": {
                await syncSubscriptionById(event.data.object.id);

                break;
            }

            case "invoice.paid":
            case "invoice.payment_failed": {
                const subscriptionId = subscriptionIdFrom(
                    event.data.object.parent?.subscription_details
                        ?.subscription,
                );

                if (subscriptionId) await syncSubscriptionById(subscriptionId);

                break;
            }
        }
    } catch (error) {
        console.error(`[stripe] Handling ${event.type} Failed`, error);

        return NextResponse.json({ error: "Handler Failed." }, { status: 500 });
    }

    return NextResponse.json({ received: true, handled: true });
}
