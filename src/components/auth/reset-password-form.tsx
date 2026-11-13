"use client";

import { resetPassword, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authErrorMessage } from "./auth-errors";
import { AuthDialogTrigger } from "./auth-dialog-trigger";
import Link from "next/link";
import { AuthField, AuthFormError, AuthSubmitButton } from "./auth-form-parts";

function ResetPasswordForm({ token }: { token: string }) {
    const router = useRouter();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const form = new FormData(event.currentTarget);
        const password = String(form.get("password"));

        if (password !== String(form.get("confirmPassword"))) {
            setError("Those Passwords Don't Match.");
            return;
        }

        setPending(true);
        setError(null);

        const { error: resetError } = await resetPassword({
            newPassword: password,
            token,
        });

        if (resetError) {
            setPending(false);
            setError(
                authErrorMessage(resetError, "Could Not Reset Your Password."),
            );
            return;
        }

        await signOut();

        setPending(false);
        setDone(true);
        router.refresh();
    }

    if (done) {
        return (
            <div className="flex flex-col gap-5 text-center">
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Your Password Is Updated And Every Session Has Been Signed
                    Out — Other Devices May Take A Few Minutes. Sign In Again
                    With Your New Password.
                </p>
                <AuthDialogTrigger mode="sign-in" className="h-11 w-full">
                    Sign In
                </AuthDialogTrigger>
                <Link
                    href="/"
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                    Back To Quiro
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AuthFormError>{error}</AuthFormError>

            <AuthField
                id="reset-password"
                name="password"
                type="password"
                label="New password"
                placeholder="At Least 8 Characters"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={pending}
            />
            <AuthField
                id="reset-password-confirm"
                name="confirmPassword"
                type="password"
                label="Confirm new password"
                placeholder="Repeat Your New Password"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={pending}
            />

            <div className="mt-1">
                <AuthSubmitButton pending={pending}>
                    Set New Password
                </AuthSubmitButton>
            </div>
        </form>
    );
}

export { ResetPasswordForm };
