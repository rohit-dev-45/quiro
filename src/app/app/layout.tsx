import { MaintenanceNotice } from "@/components/admin/maintenance-notice";
import { getAppSettings } from "@/lib/app-settings-store";
import { isCurrentUserAdmin, requireSession } from "@/lib/session";
import React from "react";

const AppLayout = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    await requireSession();

    const { maintenanceMode } = await getAppSettings();

    if (maintenanceMode && !(await isCurrentUserAdmin())) {
        return <MaintenanceNotice />;
    }

    return children;
};

export default AppLayout;
