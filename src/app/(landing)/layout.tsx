import { AuthDialogProvider } from "@/components/auth/auth-dialog-provider";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getAppSettings } from "@/lib/app-settings-store";
import { enabledSocialProviderIds } from "@/lib/auth-providers";
import React from "react";

const LandingLayout = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const { allowSignUps } = await getAppSettings();

    return (
        <AuthDialogProvider
            socialProviders={enabledSocialProviderIds()}
            allowSignUps={allowSignUps}
        >
            <div className="flex min-h-svh flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
            </div>
        </AuthDialogProvider>
    );
};

export default LandingLayout;
