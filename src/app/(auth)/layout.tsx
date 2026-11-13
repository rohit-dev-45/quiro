import { AuthDialogProvider } from "@/components/auth/auth-dialog-provider";
import { QuiroLogo } from "@/components/brand/docsy-logo";
import { enabledSocialProviderIds } from "@/lib/auth-providers";
import Link from "next/link";
import React from "react";

const AuthLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <AuthDialogProvider socialProviders={enabledSocialProviderIds()}>
            <div className="flex min-h-svh flex-col items-center justify-start px-6 pt-10 pb-6">
                <Link href="/" aria-label="Quiro Home">
                    <QuiroLogo />
                </Link>
                {children}
            </div>
        </AuthDialogProvider>
    );
};

export default AuthLayout;
