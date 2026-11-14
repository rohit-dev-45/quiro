import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ userId: string }> },
) {
    const { userId } = await params;

    const avatar = await db.avatar.findUnique({
        where: { userId },
        select: { contentType: true, data: true, updatedAt: true },
    });

    if (!avatar) {
        return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(new Uint8Array(avatar.data), {
        headers: {
            "Content-Type": avatar.contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff",
            "Content-Disposition": "inline",
            "Last-Modified": avatar.updatedAt.toUTCString(),
        },
    });
}
