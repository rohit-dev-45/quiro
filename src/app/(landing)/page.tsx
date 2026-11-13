import { EverythingInOneWorkspace } from "@/components/landing/everything-in-one-workspace";
import { Faqs } from "@/components/landing/faqs";
import { FooterCTA } from "@/components/landing/footer-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { Privacy } from "@/components/landing/privacy";
import { Stats } from "@/components/landing/stats";
import { Testimonials } from "@/components/landing/testimonials";
import { redirectIfSignedIn } from "@/lib/session";
import React from "react";

const Home = async () => {
    await redirectIfSignedIn();

    return (
        <>
            <Hero />
            <HowItWorks />
            <EverythingInOneWorkspace />
            <Privacy />
            <Stats />
            <Testimonials />
            <Pricing />
            <Faqs />
            <FooterCTA />
        </>
    );
};

export default Home;
