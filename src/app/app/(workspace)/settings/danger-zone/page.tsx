import { DangerZoneSettings } from "@/components/dashboard/settings/danger-zone-settings";
import { auth } from "@/lib/auth";
import { getNavCounts } from "@/lib/chat-store";
import { requireOrganization } from "@/lib/session";
import { Metadata } from "next";
import { headers } from "next/headers";
import React from "react";

export const metadata: Metadata = {
    title: "Danger Zone",
};

const DangerZoneSettingsPage = async () => {
    const organization = await requireOrganization();

    const [counts, accounts] = await Promise.all([
        getNavCounts(organization.id),
        auth.api.listUserAccounts({ headers: await headers() }),
    ]);

    return (
        <DangerZoneSettings
            counts={counts}
            hasPassword={accounts.some(
                (account) => account.providerId === "credential",
            )}
        />
    );
};

export default DangerZoneSettingsPage;
