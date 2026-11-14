import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { SectionHeading } from "./section-heading";

const STEPS = [
    {
        number: "01",
        title: "Upload & Index",
        description:
            "Drop In Files Or Whole Folders — 40+ Formats. Scans Are OCR'd Automatically And Embedded Into Your Private, Searchable Vector Store.",
    },
    {
        number: "02",
        title: "Ask In Plain Language",
        description:
            "Ask Across One Document Or Your Entire Library. Quiro Streams Back An Answer And Pulls From Exactly The Right Files.",
    },
    {
        number: "03",
        title: "Verify In One Click",
        description:
            "Every Claim Carries A Citation. Open The Source Reader To See The Exact Highlighted Passage And Page It Came From.",
    },
];

export function HowItWorks() {
    return (
        <section
            id="how-it-works"
            className="mx-auto w-full max-w-6xl scroll-mt-16 px-6 pt-13 pb-16 lg:pt-19 lg:pb-24"
        >
            <SectionHeading
                className="max-w-160"
                eyebrow="How It Works"
                title="From a Folder Of Files To a Trusted Answer In Three Steps."
            />

            <div className="mt-14 grid gap-6 md:grid-cols-3">
                {STEPS.map((step) => (
                    <Card
                        key={step.number}
                        className="[--card-spacing:--spacing(6)]"
                    >
                        <CardHeader className="gap-2.5">
                            <span className="mb-3 font-mono text-sm font-bold text-brand">
                                {step.number}
                            </span>
                            <CardTitle className="text-lg font-semibold">
                                {step.title}
                            </CardTitle>
                            <CardDescription className="text-[0.9375rem] leading-relaxed">
                                {step.description}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </section>
    );
}
