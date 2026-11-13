import { getOrganizations, getServerSession, isAdminUser } from "@/lib/session";

export type ApiContext = {
    userId: string;
    organizationId: string;
};

type ApiGuard =
    { ok: true; context: ApiContext } | { ok: false; response: Response };

export async function requireApiContext(): Promise<ApiGuard> {
    const session = await getServerSession();

    if (!session) {
        return {
            ok: false,
            response: Response.json(
                { error: "Not Signed In." },
                { status: 401 },
            ),
        };
    }

    const organizations = await getOrganizations();
    const activeId = session.session.activeOrganizationId;
    const organization =
        organizations.find((candidate) => candidate.id === activeId) ??
        organizations[0];

    if (!organization) {
        return {
            ok: false,
            response: Response.json(
                { error: "Create a Workspace First." },
                { status: 403 },
            ),
        };
    }

    return {
        ok: true,
        context: { userId: session.user.id, organizationId: organization.id },
    };
}

export async function requireApiAdmin(): Promise<
    { ok: true; userId: string } | { ok: false; response: Response }
> {
    const session = await getServerSession();

    if (!session) {
        return {
            ok: false,
            response: Response.json(
                { error: "Not Signed In." },
                { status: 401 },
            ),
        };
    }

    if (!isAdminUser(session.user)) {
        return {
            ok: false,
            response: Response.json({ error: "Admins Only." }, { status: 403 }),
        };
    }

    return { ok: true, userId: session.user.id };
}
