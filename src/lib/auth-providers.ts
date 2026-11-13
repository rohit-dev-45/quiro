export type SocialProviderId = "google" | "github";

type SocialProvider = {
    id: SocialProviderId;
    label: string;
    clientIdEnv: string;
    clientSecretEnv: string;
};

export const SOCIAL_PROVIDERS: readonly SocialProvider[] = [
    {
        id: "google",
        label: "Continue With Google",
        clientIdEnv: "GOOGLE_CLIENT_ID",
        clientSecretEnv: "GOOGLE_CLIENT_SECRET",
    },
    {
        id: "github",
        label: "Continue With GitHub",
        clientIdEnv: "GITHUB_CLIENT_ID",
        clientSecretEnv: "GITHUB_CLIENT_SECRET",
    },
];

type Credentials = { clientId: string; clientSecret: string };

function readCredentials(provider: SocialProvider): Credentials | null {
    const clientId = process.env[provider.clientIdEnv];
    const clientSecret = process.env[provider.clientSecretEnv];

    return clientId && clientSecret ? { clientId, clientSecret } : null;
}

export function configuredSocialProviders(): Partial<
    Record<SocialProviderId, Credentials>
> {
    const entries = SOCIAL_PROVIDERS.map(
        (provider) => [provider.id, readCredentials(provider)] as const,
    ).filter(
        (entry): entry is [SocialProviderId, Credentials] => entry[1] !== null,
    );

    return Object.fromEntries(entries);
}

export function enabledSocialProviderIds(): SocialProviderId[] {
    return SOCIAL_PROVIDERS.filter((provider) => readCredentials(provider)).map(
        (provider) => provider.id,
    );
}
