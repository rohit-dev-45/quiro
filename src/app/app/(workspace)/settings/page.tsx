import { AccountSettings } from "@/components/dashboard/settings/account-settings";
import { requireOrganization, requireSession } from "@/lib/session";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Account Settings",
};

const SettingsPage = async () => {
    const session = await requireSession();
    const organization = await requireOrganization();

    return (
        <AccountSettings
            user={session.user}
            workspace={{ id: organization.id, name: organization.name }}
        />
    );
};

export default SettingsPage;
