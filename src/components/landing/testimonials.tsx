import { Avatar, AvatarFallback } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { SectionHeading } from "./section-heading";

const TESTIMONIALS = [
    {
        quote: '"I Stopped Re-Reading 80-Page Contracts To Find One Clause. Quiro Answers And Shows Me The Exact Line — I Verify In A Click Instead Of An Hour."',
        name: "Dana Reyes",
        initials: "DR",
        role: "Counsel · Northwind Legal",
    },
    {
        quote: '"Multi-Doc Search Across A Quarter Of Filings Is The Feature I Didn\'t Know I Needed. Every Figure It Returns Is Traceable To The Page."',
        name: "Marcus Osei",
        initials: "MO",
        role: "Analyst · Meridian Capital",
    },
    {
        quote: '"When Quiro Can\'t Support A Claim, It Tells Me. That Single Behavior Is Why Our Research Team Actually Trusts It."',
        name: "Sara Kim",
        initials: "SK",
        role: "Lead · Atlas Research",
    },
];

export function Testimonials() {
    return (
        <section className="mx-auto w-full max-w-6xl px-6 py-16 lg:py-24">
            <SectionHeading
                className="max-w-160"
                eyebrow="In The Field"
                title="The People Who Can't Afford a Wrong Answer."
            />

            <div className="no-scrollbar -mx-6 mt-14 flex snap-x snap-mandatory scroll-pl-6 gap-4 overflow-x-auto px-6 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
                {TESTIMONIALS.map((testimonial) => (
                    <Card
                        key={testimonial.name}
                        className="w-[82%] shrink-0 snap-start [--card-spacing:--spacing(7)] md:w-auto"
                    >
                        <CardContent>
                            <blockquote className="text-[0.9375rem] leading-relaxed">
                                {testimonial.quote}
                            </blockquote>
                        </CardContent>

                        <CardContent className="mt-auto flex items-center gap-3">
                            <Avatar>
                                <AvatarFallback className="text-xs">
                                    {testimonial.initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex min-w-0 flex-col">
                                <span className="text-[0.9375rem] font-semibold">
                                    {testimonial.name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {testimonial.role}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}
