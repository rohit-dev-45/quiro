import { ChatConversation } from "@/components/chat/chat-conversation";
import { ChatHeader } from "@/components/chat/chat-header";
import { getChat } from "@/lib/chat-store";
import { requireOrganization, requireSession } from "@/lib/session";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

type ChatPageProps = {
    params: Promise<{ chatId: string }>;
};

export async function generateMetadata({
    params,
}: ChatPageProps): Promise<Metadata> {
    const { chatId } = await params;
    const organization = await requireOrganization();
    const chat = await getChat(chatId, organization.id);

    return { title: chat?.title ?? "Chat" };
}

const ChatPage = async ({ params }: ChatPageProps) => {
    const { chatId } = await params;
    const session = await requireSession();
    const organization = await requireOrganization();
    const chat = await getChat(chatId, organization.id);

    if (!chat) {
        notFound();
    }

    return (
        <>
            <ChatHeader
                user={session.user}
                title={chat.title}
                documentCount={chat.documents.length}
            />
            <ChatConversation chat={chat} />
        </>
    );
};

export default ChatPage;
