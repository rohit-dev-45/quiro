"use client";

import { SocialProviderId } from "@/lib/auth-providers";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { SignInDialog } from "./sign-in-dialog";
import { SignUpDialog } from "./sign-up-dialog";

export type AuthMode = "sign-in" | "sign-up";

type AuthDialogContextValue = {
    mode: AuthMode | null;
    open: (mode: AuthMode) => void;
    close: () => void;
};

const AuthDialogContext = createContext<AuthDialogContextValue | null>(null);

function useAuthDialog() {
    const context = useContext(AuthDialogContext);

    if (!context) {
        throw new Error(
            "useAuthDialog Must Be Used Inside <AuthDialogProvider>",
        );
    }

    return context;
}

function AuthDialogProvider({
    socialProviders = [],
    allowSignUps = true,
    children,
}: {
    socialProviders?: SocialProviderId[];
    allowSignUps?: boolean;
    children: ReactNode;
}) {
    const [mode, setMode] = useState<AuthMode | null>(null);

    const value = useMemo<AuthDialogContextValue>(
        () => ({
            mode,
            open: (next) => setMode(next),
            close: () => setMode(null),
        }),
        [mode],
    );

    return (
        <AuthDialogContext value={value}>
            {children}

            <SignInDialog
                open={mode === "sign-in"}
                onOpenChange={(open) => setMode(open ? "sign-in" : null)}
                onSwitchToSignUp={() => setMode("sign-up")}
                socialProviders={socialProviders}
            />
            <SignUpDialog
                open={mode === "sign-up"}
                onOpenChange={(open) => setMode(open ? "sign-up" : null)}
                onSwitchToSignIn={() => setMode("sign-in")}
                socialProviders={socialProviders}
                allowSignUps={allowSignUps}
            />
        </AuthDialogContext>
    );
}

export { AuthDialogProvider, useAuthDialog };
