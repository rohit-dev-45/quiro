import { ArrowRightIcon, CheckIcon, PlayIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Link from "next/link";
import { HeroPreview } from "./hero-preview";
import { TrustedBy } from "./trusted-by";

const PROOF_POINTS = ["Free For 5 Documents", "No Card Required"];

const CTA_CLASSES =
    "h-11 w-full px-5 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5 sm:w-auto";

export function Hero() {
    return (
        <section className="mx-auto w-full max-w-6xl px-6 pt-16 pb-13 lg:pt-24 lg:pb-19">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="flex flex-col items-start gap-6">
                    <Badge
                        variant="outline"
                        className="h-7 gap-2 px-3 text-sm font-normal text-muted-foreground"
                    >
                        <span
                            aria-hidden
                            className="size-1.5 rounded-full bg-brand"
                        />
                        Grounded Answers — a Citation For Every Claim
                    </Badge>

                    <h1 className="text-4xl leading-[1.05] font-bold tracking-tight sm:text-5xl lg:text-6xl">
                        <span className="block">Chat With Your Documents.</span>
                        <span className="relative inline-block">
                            <span
                                aria-hidden
                                className="absolute inset-x-0 bottom-[0.06em] h-[0.24em] bg-brand/25"
                            />
                            <span className="relative">Verify Every Word.</span>
                        </span>
                    </h1>

                    <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                        Quiro Reads Your PDFs, Contracts, And Reports, Then
                        Answers In Plain Language — With A Link To The Exact
                        Passage Behind Every Claim. No More Ctrl-F. No Skimming.
                        No Hallucinations.
                    </p>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        Try Quiro Free
                        <ArrowRightIcon data-icon="inline-end" />
                        <Button
                            variant="outline"
                            className={CTA_CLASSES}
                            render={<Link href="#how-it-works" />}
                            nativeButton={false}
                        >
                            <PlayIcon
                                data-icon="inline-start"
                                className="fill-current"
                            />
                            See How It Works
                        </Button>
                    </div>

                    <ul className="flex flex-wrap gap-x-6 gap-y-2">
                        {PROOF_POINTS.map((point) => (
                            <li
                                key={point}
                                className="flex items-center gap-1.5 text-sm text-muted-foreground"
                            >
                                <CheckIcon className="size-4 text-brand" />
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>

                <HeroPreview />
            </div>

            <TrustedBy className="mt-20 lg:mt-28" />
        </section>
    );
}
