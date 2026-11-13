import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { redirectIfOnboarded, requireSession } from "@/lib/session";
import React from "react";

const OnboardingLayout = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const session = await requireSession();
    await redirectIfOnboarded();

    return (
        <div className="flex min-h-svh flex-col">
            <DashboardHeader
                user={session.user}
                title="Welcome"
                showSearch={false}
            />
            <main className="flex flex-1 flex-col">{children}</main>
        </div>
    );
};

export default OnboardingLayout;
