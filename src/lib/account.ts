import { db } from "./db";

async function soleOrganizationIds(userId: string) {
    const memberships = await db.member.findMany({
        where: { userId },
        select: { organizationId: true },
    });

    const organizationIds = memberships.map((member) => member.organizationId);

    if (organizationIds.length === 0) return [];

    const shared = await db.member.findMany({
        where: {
            organizationId: { in: organizationIds },
            userId: { not: userId },
        },
        select: { organizationId: true },
        distinct: ["organizationId"],
    });

    const sharedIds = new Set(shared.map((member) => member.organizationId));

    return organizationIds.filter((id) => !sharedIds.has(id));
}

export async function purgeUserData(userId: string) {
    const organizationIds = await soleOrganizationIds(userId);

    await db.$transaction([
        db.avatar.deleteMany({ where: { userId } }),
        db.chat.deleteMany({
            where: { organizationId: { in: organizationIds } },
        }),
        db.document.deleteMany({
            where: { organizationId: { in: organizationIds } },
        }),
        db.questionEvent.deleteMany({
            where: { organizationId: { in: organizationIds } },
        }),
        db.organization.deleteMany({ where: { id: { in: organizationIds } } }),
    ]);
}
