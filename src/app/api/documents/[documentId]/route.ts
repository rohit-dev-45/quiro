import { requireApiContext } from "@/lib/api-session";
import { deleteDocument } from "@/lib/chat-store";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ documentId: string }> },
) {
    const guard = await requireApiContext();
    if (!guard.ok) return guard.response;

    const { documentId } = await params;

    const document = await db.document.findFirst({
        where: { id: documentId, organizationId: guard.context.organizationId },
        select: { name: true, contentType: true, data: true },
    });

    if (!document) {
        return NextResponse.json(
            { error: "Document Not Found." },
            { status: 404 },
        );
    }

    return new NextResponse(new Uint8Array(document.data), {
        headers: {
            "Content-Type": document.contentType || "application/octet-stream",
            "Content-Disposition": `inline; filename="${document.name.replace(/"/g, "")}"`,
            "Cache-Control": "private, max-age=300",
        },
    });
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ documentId: string }> },
) {
    const guard = await requireApiContext();
    if (!guard.ok) return guard.response;

    const { documentId } = await params;

    const deleted = await deleteDocument(
        documentId,
        guard.context.organizationId,
    );

    if (!deleted) {
        return NextResponse.json(
            { error: "Document Not Found." },
            { status: 404 },
        );
    }

    return NextResponse.json({ ok: true });
}
