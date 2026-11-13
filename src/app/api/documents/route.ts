import { requireApiContext } from "@/lib/api-session";
import { formatBytes, LibraryDocumentView } from "@/lib/chat";
import { clearDocuments, listLibraryDocuments } from "@/lib/chat-store";
import { db } from "@/lib/db";
import {
    classifyDocument,
    documentMeta,
    extractDocument,
    MAX_DOCUMENT_BYTES,
} from "@/lib/documents";
import { NextResponse } from "next/server";

export async function GET() {
    const guard = await requireApiContext();
    if (!guard.ok) return guard.response;

    return NextResponse.json(
        await listLibraryDocuments(guard.context.organizationId),
    );
}

export async function POST(request: Request) {
    const guard = await requireApiContext();
    if (!guard.ok) return guard.response;

    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
        return NextResponse.json(
            { error: "No File Uploaded." },
            { status: 400 },
        );
    }

    if (file.size === 0) {
        return NextResponse.json(
            { error: "That File Is Empty." },
            { status: 400 },
        );
    }

    if (file.size > MAX_DOCUMENT_BYTES) {
        return NextResponse.json(
            {
                error: `That File Is ${formatBytes(file.size)}. The Limit Is ${formatBytes(MAX_DOCUMENT_BYTES)}.`,
            },
            { status: 413 },
        );
    }

    const type = classifyDocument(file.name, file.type);

    if (!type) {
        return NextResponse.json(
            {
                error: "Quiro Reads PDF, Word (.docx), Text And Markdown Files.",
            },
            { status: 415 },
        );
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    let extracted;
    try {
        extracted = await extractDocument(bytes, type.kind);
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Couldn't Read That File.",
            },
            { status: 422 },
        );
    }

    const document = await db.document.create({
        data: {
            organizationId: guard.context.organizationId,
            userId: guard.context.userId,
            name: file.name,
            contentType: file.type || "application/octet-stream",
            sizeBytes: file.size,
            pageCount: extracted.pageCount,
            data: bytes,
            text: extracted.text,
            status: "READY",
        },
        select: { id: true, name: true, sizeBytes: true, pageCount: true },
    });

    const view: LibraryDocumentView = {
        id: document.id,
        name: document.name,
        meta: documentMeta(document.sizeBytes, document.pageCount),
        format: type.format,
        status: "READY",
    };

    return NextResponse.json(view, { status: 201 });
}

export async function DELETE() {
    const guard = await requireApiContext();
    if (!guard.ok) return guard.response;

    const documents = await clearDocuments(guard.context.organizationId);

    return NextResponse.json({ documents });
}
