import {
    BookOpenIcon,
    CommandIcon,
    FileIcon,
    LayersIcon,
    MessageSquareIcon,
    Share2Icon,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

const FEATURES = [
    {
        icon: MessageSquareIcon,
        title: "Chat With Citations",
        description:
            "Streaming Answers Where Every Claim Links To The Exact Line It's Based On. If The Source Isn't There, Docsy Says So.",
    },
    {
        icon: BookOpenIcon,
        title: "Side-By-Side Source Reader",
        description:
            "The Passage Behind Each Answer Highlighted Next To Your Chat — Read It In Context Without Leaving The Conversation.",
    },
    {
        icon: LayersIcon,
        title: "Multi-Document Search",
        description:
            "Ask Across Your Whole Library At Once. Docsy Retrieves From The Right Files By Meaning, Not Just Keywords.",
    },
    {
        icon: FileIcon,
        title: "40+ Formats & OCR",
        description:
            "PDFs, Word, Slides, Spreadsheets, Plain Text — Even Scanned Documents, Read Automatically With Built-In OCR.",
    },
    {
        icon: CommandIcon,
        title: "⌘K Command Palette",
        description:
            "Search, Ask, Or Jump Anywhere From The Keyboard. Chat History, Shortcuts, And A Workflow Built For Power Users.",
    },
    {
        icon: Share2Icon,
        title: "Export & Integrate",
        description:
            "Export Any Conversation To Markdown Or A Shareable Link. Connect Google Drive And Notion To Keep Sources In Sync.",
    },
];

export function EverythingInOneWorkspace() {
    return (
        <section id="product" className="scroll-mt-16 border-y bg-surface">
            <div className="mx-auto w-full max-w-6xl px-6 py-16 lg:py-24">
                <SectionHeading
                    className="max-w-160"
                    eyebrow="Everything In One Workspace"
                    title="Built For People Who Have To Be Right — And Prove It."
                />

                <div className="no-scrollbar -mx-6 mt-14 flex snap-x snap-mandatory scroll-pl-6 gap-4 overflow-x-auto px-6 md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 lg:grid-cols-3">
                    {FEATURES.map(({ icon: Icon, title, description }) => (
                        <Card
                            key={title}
                            className="w-[82%] shrink-0 snap-start [--card-spacing:--spacing(6)] md:w-auto"
                        >
                            <CardHeader className="gap-2">
                                <span className="mb-3 flex size-9 items-center justify-center rounded-lg bg-muted text-brand">
                                    <Icon className="size-4.5" />
                                </span>
                                <CardTitle className="text-base font-semibold">
                                    {title}
                                </CardTitle>
                                <CardDescription className="leading-relaxed">
                                    {description}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
