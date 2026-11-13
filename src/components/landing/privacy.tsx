import {
    ArrowRightIcon,
    CheckIcon,
    LockIcon,
    ShieldIcon,
    Trash2Icon,
} from "lucide-react";
import { Card } from "../ui/card";
import { SectionHeading } from "./section-heading";
import Link from "next/link";
import { Fragment } from "react/jsx-runtime";
import { Separator } from "../ui/separator";

const GUARANTEES = [
    {
        icon: LockIcon,
        title: "Encrypted In Transit And At Rest",
        description:
            "AES-256 Storage In An Isolated, Per-Workspace Vector Store.",
    },
    {
        icon: ShieldIcon,
        title: "Never Used To Train Models",
        description: "Your Content Is Yours. We Don't Train On It — Ever.",
    },
    {
        icon: Trash2Icon,
        title: "Delete Anything, Anytime",
        description:
            "Remove A Document Or A Conversation And Its Embeddings Go With It.",
    },
    {
        icon: CheckIcon,
        title: "SOC 2 & Audit-Ready",
        description:
            "Independently Audited, With An Activity Log Of Every Action.",
    },
];

export function Privacy() {
    return (
        <section
            id="security"
            className="mx-auto w-full max-w-6xl scroll-mt-16 px-6 py-16 lg:py-24"
        >
            <Card className="grid grid-cols-1 gap-0 p-0 lg:grid-cols-2">
                <div className="p-8 lg:p-12">
                    <SectionHeading
                        size="sm"
                        eyebrow="Privacy By Default"
                        title="Your Documents Stay Yours."
                        description={
                            <>
                                Trustworthy Answers Start With Trustworthy
                                Handling.
                                <br />
                                Quiro Is Built So Sensitive Files Never Leave
                                Your Control.
                            </>
                        }
                    />
                    <Link
                        href="/security"
                        className="group mt-8 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-brand"
                    >
                        Read The Security Overview
                        <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>

                <div className="flex flex-col gap-5 border-t bg-surface p-8 lg:border-t-0 lg:border-l lg:p-12">
                    {GUARANTEES.map(
                        ({ icon: Icon, title, description }, index) => (
                            <Fragment key={title}>
                                {index > 0 ? <Separator /> : null}
                                <div className="flex gap-3">
                                    <Icon className="mt-0.5 size-4.5 shrink-0 text-brand" />
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-[0.9375rem] font-semibold">
                                            {title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {description}
                                        </p>
                                    </div>
                                </div>
                            </Fragment>
                        ),
                    )}
                </div>
            </Card>
        </section>
    );
}
