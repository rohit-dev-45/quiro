import { requireApiContext } from "@/lib/api-session";
import { listChats, listLibraryDocuments } from "@/lib/chat-store";
import { NextResponse } from "next/server";

export async function GET() {
    const guard = await requireApiContext();
    if (!guard.ok) return guard.response;

    const [chats, documents] = await Promise.all([
        listChats(guard.context.organizationId),
        listLibraryDocuments(guard.context.organizationId),
    ]);

    return NextResponse.json({ chats, documents });
}
