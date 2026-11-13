import { CreateOrganizationForm } from "@/components/onboarding/create-organization-form";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Name Your Organization",
};

const OnboardingPage = () => {
    return <CreateOrganizationForm />;
};

export default OnboardingPage;
