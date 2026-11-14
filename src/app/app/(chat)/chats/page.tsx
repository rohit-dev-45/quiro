import { ChatHeader } from "@/components/chat/chat-header";
import { NewChatPanel } from "@/components/chat/new-chat-panel";
import { listLibraryDocuments } from "@/lib/chat-store";
import { requireOrganization, requireSession } from "@/lib/session";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
    title: "New Chat",
};

const NewChatPage = async () => {
    const session = await requireSession();
    const organization = await requireOrganization();
    const documents = await listLibraryDocuments(organization.id);

    return (
        <>
            <ChatHeader user={session.user} title="New Chat" />
            <NewChatPanel documents={documents} />
        </>
    );
};

export default NewChatPage;
