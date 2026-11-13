import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
    title: "Reset Password",
};

const ResetPasswordPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ token?: string; error?: string }>;
}) => {
    const { token, error } = await searchParams;
    const isValid = Boolean(token) && !error;

    return (
        <div className="w-full max-w-100 rounded-xl bg-popover p-8 ring-1 ring-foreground/10">
            <div className="mb-6 flex flex-col gap-1.5 text-center">
                <h1 className="font-heading text-xl leading-tight font-bold">
                    {isValid
                        ? "Choose a New Password"
                        : "This Link Has Expired"}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {isValid
                        ? "Pick Something You Haven't Used Elsewhere"
                        : "Reset Links Are Single-Use And Last One Hour"}
                </p>
            </div>

            {isValid ? (
                <ResetPasswordForm token={token!} />
            ) : (
                <Button
                    className="h-11 w-full"
                    render={<Link href="/" />}
                    nativeButton={false}
                >
                    Request a New Link
                </Button>
            )}
        </div>
    );
};

export default ResetPasswordPage;
