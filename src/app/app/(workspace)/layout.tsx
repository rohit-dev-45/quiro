import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { planLabel } from "@/lib/billing";
import { getWorkspacePlan } from "@/lib/billing-store";
import { getNavCounts } from "@/lib/chat-store";
import {
    isCurrentUserAdmin,
    requireOrganization,
    requireSession,
} from "@/lib/session";
import { cookies } from "next/headers";
import React from "react";

const SIDEBAR_COOKIE_NAME = "sidebar_state";

const WorkspaceLayout = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const session = await requireSession();
    const organization = await requireOrganization();
    const [cookieStore, counts, planId, isAdmin] = await Promise.all([
        cookies(),
        getNavCounts(organization.id),
        getWorkspacePlan(organization.id),
        isCurrentUserAdmin(),
    ]);

    return (
        <SidebarProvider
            defaultOpen={
                cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== "false"
            }
        >
            <DashboardSidebar
                user={session.user}
                workspaceName={organization.name}
                counts={counts}
                planLabel={planLabel(planId)}
                isAdmin={isAdmin}
            />

            <SidebarInset className="min-w-0">
                <DashboardHeader user={session.user} showSidebarTrigger />
                <div className="flex-1">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default WorkspaceLayout;
