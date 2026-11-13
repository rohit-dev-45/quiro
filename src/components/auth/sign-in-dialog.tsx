"use client";

import { requestPasswordReset, signIn } from "@/lib/auth-client";
import { SocialProviderId } from "@/lib/auth-providers";
import { APP_ROOT } from "@/lib/dashboard-nav";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authErrorMessage } from "./auth-errors";
import { AuthDialogShell, AuthSwitchButton } from "./auth-dialog-shell";
import { SocialAuthButtons } from "./social-auth-buttons";
import {
    AuthDivider,
    AuthField,
    AuthFormError,
    AuthSubmitButton,
} from "./auth-form-parts";

type View = "credentials" | "forgot-password" | "reset-sent";

const COPY: Record<View, { title: string; description: string }> = {
    credentials: {
        title: "Sign In To Quiro",
        description: "Welcome Back — Continue To Your Workspace",
    },
    "forgot-password": {
        title: "Reset Your Password",
        description: "We'll Email You A Link To Set A New One",
    },
    "reset-sent": {
        title: "Check Your Inbox",
        description: "If That Email Has An Account, A Reset Link Is On Its Way",
    },
};

function SignInDialog({
    open,
    onOpenChange,
    onSwitchToSignUp,
    socialProviders = [],
    callbackURL = APP_ROOT,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSwitchToSignUp: () => void;
    socialProviders?: SocialProviderId[];
    callbackURL?: string;
}) {
    const router = useRouter();
    const [view, setView] = useState<View>("credentials");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleOpenChange(next: boolean) {
        if (!next) {
            setError(null);
            setTimeout(() => setView("credentials"), 150);
        }
        onOpenChange(next);
    }

    function goTo(next: View) {
        setError(null);
        setView(next);
    }

    async function handleSignIn(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const form = new FormData(event.currentTarget);
        const email = String(form.get("email"));
        const password = String(form.get("password"));

        setPending(true);
        setError(null);

        const { error: signInError } = await signIn.email({
            email,
            password,
        });

        setPending(false);

        if (signInError) {
            if (
                signInError.status === 403 ||
                signInError.code === "EMAIL_NOT_VERIFIED"
            ) {
                handleOpenChange(false);

                router.push(`/verify-email?email=${encodeURIComponent(email)}`);

                return;
            }

            setError(authErrorMessage(signInError, "Could Not Sign You In."));
            return;
        }

        handleOpenChange(false);
        router.push(APP_ROOT);
    }

    async function handleForgotPassword(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const form = new FormData(event.currentTarget);
        setPending(true);
        setError(null);

        const { error: resetError } = await requestPasswordReset({
            email: String(form.get("email")),
            redirectTo: `${window.location.origin}/reset-password`,
        });

        setPending(false);

        if (resetError) {
            setError(
                authErrorMessage(resetError, "Could Not Send The Reset Link."),
            );
            return;
        }

        setView("reset-sent");
    }

    const { title, description } = COPY[view];

    return (
        <AuthDialogShell
            open={open}
            onOpenChange={handleOpenChange}
            title={title}
            description={description}
            footer={
                view === "credentials" ? (
                    <>
                        Don&apos;t Have An Account?{" "}
                        <AuthSwitchButton onClick={onSwitchToSignUp}>
                            Sign Up
                        </AuthSwitchButton>
                    </>
                ) : (
                    <>
                        Remembered It?{" "}
                        <AuthSwitchButton onClick={() => goTo("credentials")}>
                            Back To Sign In
                        </AuthSwitchButton>
                    </>
                )
            }
        >
            {view === "credentials" && (
                <div className="flex flex-col gap-5">
                    <SocialAuthButtons
                        providers={socialProviders}
                        callbackURL={callbackURL}
                        disabled={pending}
                        onError={(message) => setError(message || null)}
                    />
                    {socialProviders.length > 0 && <AuthDivider />}

                    <form
                        onSubmit={handleSignIn}
                        className="flex flex-col gap-4"
                    >
                        <AuthFormError>{error}</AuthFormError>

                        <AuthField
                            id="sign-in-email"
                            name="email"
                            type="email"
                            label="Email address"
                            placeholder="you@company.com"
                            autoComplete="email"
                            required
                            disabled={pending}
                        />
                        <AuthField
                            id="sign-in-password"
                            name="password"
                            type="password"
                            label="Password"
                            placeholder="Your Password"
                            autoComplete="current-password"
                            required
                            disabled={pending}
                            action={
                                <button
                                    type="button"
                                    onClick={() => goTo("forgot-password")}
                                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            }
                        />

                        <div className="mt-1">
                            <AuthSubmitButton pending={pending}>
                                Continue
                            </AuthSubmitButton>
                        </div>
                    </form>
                </div>
            )}

            {view === "forgot-password" && (
                <form
                    onSubmit={handleForgotPassword}
                    className="flex flex-col gap-4"
                >
                    <AuthFormError>{error}</AuthFormError>

                    <AuthField
                        id="forgot-password-email"
                        name="email"
                        type="email"
                        label="Email address"
                        placeholder="you@company.com"
                        autoComplete="email"
                        required
                        disabled={pending}
                    />

                    <div className="mt-1">
                        <AuthSubmitButton pending={pending}>
                            Send Reset Link
                        </AuthSubmitButton>
                    </div>
                </form>
            )}

            {view === "reset-sent" && (
                <p className="text-center text-sm leading-relaxed text-muted-foreground">
                    Open The Link Within The Hour To Choose a New Password.
                    Nothing Arrived? Check Your Spam Folder, Then Try Again.
                </p>
            )}
        </AuthDialogShell>
    );
}

export { SignInDialog };
