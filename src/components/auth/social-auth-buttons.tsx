"use client";

import { signIn } from "@/lib/auth-client";
import { SOCIAL_PROVIDERS, SocialProviderId } from "@/lib/auth-providers";
import { useState } from "react";
import { PROVIDER_ICONS } from "./provider-icons";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

function SocialAuthButtons({
    providers,
    callbackURL,
    disabled,
    onError,
}: {
    providers: SocialProviderId[];
    callbackURL: string;
    disabled?: boolean;
    onError: (message: string) => void;
}) {
    const [pending, setPending] = useState<SocialProviderId | null>(null);

    if (providers.length === 0) return null;

    async function handleClick(provider: SocialProviderId) {
        setPending(provider);
        onError("");

        const { error } = await signIn.social({ provider, callbackURL });

        if (error) {
            setPending(null);
            onError(
                error.message ?? "Could Not Reach The Provider. Try Again.",
            );
        }
    }

    return (
        <div className="flex flex-col gap-3">
            {SOCIAL_PROVIDERS.filter((provider) =>
                providers.includes(provider.id),
            ).map((provider) => {
                const Icon = PROVIDER_ICONS[provider.id];

                return (
                    <Button
                        key={provider.id}
                        type="button"
                        variant="outline"
                        className="h-11 w-full gap-2.5 text-sm font-medium"
                        disabled={disabled || pending !== null}
                        onClick={() => handleClick(provider.id)}
                    >
                        {pending === provider.id ? (
                            <Spinner />
                        ) : (
                            <Icon className="size-4.5" />
                        )}
                        {provider.label}
                    </Button>
                );
            })}
        </div>
    );
}

export { SocialAuthButtons };
