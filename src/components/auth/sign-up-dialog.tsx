"use client";

import { signUp } from "@/lib/auth-client";
import { SocialProviderId } from "@/lib/auth-providers";
import { APP_ROOT } from "@/lib/dashboard-nav";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authErrorMessage } from "./auth-errors";
import { AuthDialogShell, AuthSwitchButton } from "./auth-dialog-shell";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { LockIcon } from "lucide-react";
import { SocialAuthButtons } from "./social-auth-buttons";
import {
    AuthDivider,
    AuthField,
    AuthFormError,
    AuthSubmitButton,
} from "./auth-form-parts";

function SignUpDialog({
    open,
    onOpenChange,
    onSwitchToSignIn,
    socialProviders = [],
    allowSignUps = true,
    callbackURL = APP_ROOT,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSwitchToSignIn: () => void;
    socialProviders?: SocialProviderId[];
    allowSignUps?: boolean;
    callbackURL?: string;
}) {
    const router = useRouter();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleOpenChange(next: boolean) {
        if (!next) setError(null);
        onOpenChange(next);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const form = new FormData(event.currentTarget);
        setPending(true);
        setError(null);

        const { data, error: signUpError } = await signUp.email({
            name: String(form.get("name")),
            email: String(form.get("email")),
            password: String(form.get("password")),
            callbackURL,
        });

        setPending(false);

        if (signUpError) {
            setError(
                authErrorMessage(signUpError, "Could Not Create Your Account."),
            );
            return;
        }

        const email = String(form.get("email"));

        handleOpenChange(false);

        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    }

    return (
        <AuthDialogShell
            open={open}
            onOpenChange={handleOpenChange}
            title="Create Your Account"
            description="To Start Chatting With Your Documents"
            footer={
                <>
                    Already Have An Account?{" "}
                    <AuthSwitchButton onClick={onSwitchToSignIn}>
                        Sign In
                    </AuthSwitchButton>
                </>
            }
        >
            {!allowSignUps ? (
                <Alert>
                    <LockIcon />
                    <AlertTitle>New Sign-Ups Are Closed Right Now.</AlertTitle>
                    <AlertDescription>
                        Quiro Isn&apos;t Accepting New Accounts At The Moment.
                        If You Already Have One, Sign In Instead.
                    </AlertDescription>
                </Alert>
            ) : (
                <div className="flex flex-col gap-5">
                    <SocialAuthButtons
                        providers={socialProviders}
                        callbackURL={callbackURL}
                        disabled={pending}
                        onError={(message) => setError(message || null)}
                    />
                    {socialProviders.length > 0 && <AuthDivider />}

                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4"
                    >
                        <AuthFormError>{error}</AuthFormError>

                        <AuthField
                            id="sign-up-name"
                            name="name"
                            label="Full name"
                            placeholder="Ada Lovelace"
                            autoComplete="name"
                            required
                            disabled={pending}
                        />
                        <AuthField
                            id="sign-up-email"
                            name="email"
                            type="email"
                            label="Email address"
                            placeholder="you@company.com"
                            autoComplete="email"
                            required
                            disabled={pending}
                        />
                        <AuthField
                            id="sign-up-password"
                            name="password"
                            type="password"
                            label="Password"
                            placeholder="At Least 8 Characters"
                            autoComplete="new-password"
                            minLength={8}
                            required
                            disabled={pending}
                        />

                        <div className="mt-1">
                            <AuthSubmitButton pending={pending}>
                                Create Account
                            </AuthSubmitButton>
                        </div>
                    </form>
                </div>
            )}
        </AuthDialogShell>
    );
}

export { SignUpDialog };
