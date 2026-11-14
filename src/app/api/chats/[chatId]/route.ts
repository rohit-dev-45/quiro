import { requireApiContext } from "@/lib/api-session";
import { deleteChat } from "@/lib/chat-store";
import { NextResponse } from "next/server";

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ chatId: string }> },
) {
    const guard = await requireApiContext();
    if (!guard.ok) return guard.response;

    const { chatId } = await params;

    const result = await deleteChat(chatId, guard.context.organizationId);

    if (!result) {
        return NextResponse.json({ error: "Chat Not Found." }, { status: 404 });
    }

    return NextResponse.json(result);
}
