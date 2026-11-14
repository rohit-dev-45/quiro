import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { planLabel } from "@/lib/billing";
import { getWorkspacePlan } from "@/lib/billing-store";
import { listChats } from "@/lib/chat-store";
import { requireOrganization, requireSession } from "@/lib/session";
import { cookies } from "next/headers";
import React from "react";

const SIDEBAR_COOKIE_NAME = "sidebar_state";

const ChatLayout = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const session = await requireSession();
    const organization = await requireOrganization();
    const [chats, cookieStore, planId] = await Promise.all([
        listChats(organization.id),
        cookies(),
        getWorkspacePlan(organization.id),
    ]);

    return (
        <SidebarProvider
            defaultOpen={
                cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== "false"
            }
        >
            <ChatSidebar
                user={session.user}
                chats={chats}
                planLabel={planLabel(planId)}
            />

            <SidebarInset className="h-svh min-w-0 overflow-hidden">
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
};

export default ChatLayout;
