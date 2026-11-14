import { SettingsTabs } from "@/components/dashboard/settings/settings-tabs";
import React from "react";

const SettingsLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div className="mx-auto w-full max-w-180 px-6 py-10">
            <h2 className="font-heading text-3xl font-bold tracking-tight">
                Settings
            </h2>
            <p className="mt-2 text-muted-foreground">
                Manage Your Profile, Plan, And Account.
            </p>

            <div className="mt-8">
                <SettingsTabs />
            </div>

            <div className="mt-6">{children}</div>
        </div>
    );
};

export default SettingsLayout;
