"use client";

import { BillingPeriod, PLANS } from "@/lib/pricing";
import { useState } from "react";
import { SectionHeading } from "./section-heading";
import { BillingToggle } from "./billing-toggle";
import { PricingCard } from "./pricing-card";
import Link from "next/link";

export function Pricing() {
    const [period, setPeriod] = useState<BillingPeriod>("annual");

    return (
        <section id="pricing" className="scroll-mt-16 border-y bg-surface">
            <div className="mx-auto w-full max-w-6xl px-6 py-16 lg:py-24">
                <SectionHeading
                    className="mx-auto max-w-160 items-center text-center"
                    eyebrow="Pricing"
                    title="Start Free. Upgrade When The Answers Pay For Themselves."
                />

                <BillingToggle
                    className="mt-8"
                    value={period}
                    onValueChange={setPeriod}
                />

                <div className="mx-auto mt-10 grid max-w-5xl items-start gap-5 md:grid-cols-3">
                    {PLANS.map((plan) => (
                        <PricingCard
                            key={plan.id}
                            plan={plan}
                            period={period}
                        />
                    ))}
                </div>

                <p className="mt-10 text-center text-sm text-muted-foreground">
                    Questions Are The Only Limit That Changes Between Plans.{" "}
                    <Link href="/contact" className="font-semibold text-brand">
                        Talk To Us
                    </Link>{" "}
                    About Custom Volumes.
                </p>
            </div>
        </section>
    );
}
