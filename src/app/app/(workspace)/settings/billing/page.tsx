import { BillingSettings } from "@/components/dashboard/settings/billing-settings";
import { reconcileCheckoutSession } from "@/lib/billing-store";
import { requireOrganization } from "@/lib/session";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Billing",
};

const BillingSettingsPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ checkout?: string; session_id?: string }>;
}) => {
    const { checkout, session_id: sessionId } = await searchParams;

    if (checkout === "success" && sessionId) {
        const organization = await requireOrganization();

        try {
            await reconcileCheckoutSession(sessionId, organization.id);
        } catch (error) {
            console.error("[billing] Checkout Reconcile Failed", error);
        }
    }

    return <BillingSettings checkout={checkout} />;
};

export default BillingSettingsPage;
