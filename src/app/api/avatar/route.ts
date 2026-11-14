import { auth } from "@/lib/auth";
import {
    AVATAR_MAX_BYTES,
    AVATAR_MIME_TYPES,
    avatarUrl,
    sniffImageType,
} from "@/lib/avatar";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({ headers: requestHeaders });

    if (!session) {
        return NextResponse.json({ error: "Not Signed In." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
        return NextResponse.json(
            { error: "No File Received." },
            { status: 400 },
        );
    }

    if (file.size > AVATAR_MAX_BYTES) {
        return NextResponse.json(
            { error: "That Image Is Over 2 MB." },
            { status: 413 },
        );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const contentType = sniffImageType(bytes);

    if (!contentType || !AVATAR_MIME_TYPES.includes(contentType)) {
        return NextResponse.json(
            { error: "Use a PNG, JPEG, Or WebP Image." },
            { status: 415 },
        );
    }

    const userId = session.user.id;
    const data = Buffer.from(bytes);

    const avatar = await db.avatar.upsert({
        where: { userId },
        create: { userId, contentType, data },
        update: { contentType, data },
    });

    const image = avatarUrl(userId, avatar.updatedAt);

    await auth.api.updateUser({ headers: requestHeaders, body: { image } });

    return NextResponse.json({ image });
}

export async function DELETE() {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({ headers: requestHeaders });

    if (!session) {
        return NextResponse.json({ error: "Not Signed In." }, { status: 401 });
    }

    await db.avatar.deleteMany({ where: { userId: session.user.id } });
    await auth.api.updateUser({
        headers: requestHeaders,
        body: { image: null },
    });

    return NextResponse.json({ image: null });
}
