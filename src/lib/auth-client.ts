import { createAuthClient } from "better-auth/react";
import { adminClient, organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
    plugins: [organizationClient(), adminClient()],
});

export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession,
    requestPasswordReset,
    resetPassword,
    organization,
    useActiveOrganization,
    useListOrganizations,
} = authClient;

export type Session = typeof authClient.$Infer.Session;
export type SessionUser = Session["user"];
export type Organization = typeof authClient.$Infer.Organization;
