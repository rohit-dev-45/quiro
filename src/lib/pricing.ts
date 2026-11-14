export type BillingPeriod = "monthly" | "annual";

export type PlanFeature = {
    label: string;
    emphasis?: boolean;
};

export type Plan = {
    id: string;
    name: string;
    description: string;
    price: Record<BillingPeriod, number>;
    cta: { label: string };
    ctaVariant: "default" | "outline";
    features: PlanFeature[];
    highlighted?: boolean;
};

export const ANNUAL_DISCOUNT = "−20%";

export const PLANS: Plan[] = [
    {
        id: "free",
        name: "Free",
        description: "For Trying It On A Handful Of Files.",
        price: { monthly: 0, annual: 0 },
        cta: { label: "Get Started" },
        ctaVariant: "outline",
        features: [
            { label: "Up To 5 Documents" },
            { label: "5 Questions Per Month" },
            { label: "Cited Answers & Source Reader" },
            { label: "OCR For Scanned Files" },
        ],
    },
    {
        id: "pro",
        name: "Pro",
        description: "For Professionals Living In Documents.",
        price: { monthly: 19, annual: 15 },
        cta: { label: "Try Quiro Free" },
        ctaVariant: "default",
        highlighted: true,
        features: [
            { label: "Everything In Free, Plus:" },
            { label: "Unlimited Documents" },
            { label: "50 Questions Per Month" },
            { label: "Multi-Document Search" },
            { label: "Stronger Model & API Access" },
            { label: "Drive & Notion Integrations" },
        ],
    },
    {
        id: "business",
        name: "Business",
        description: "For Power Users Who Never Want To Hit A Limit.",
        price: { monthly: 49, annual: 39 },
        cta: { label: "Get Business" },
        ctaVariant: "outline",
        features: [
            { label: "Everything In Pro, Plus:" },
            { label: "Unlimited Questions Per Month", emphasis: true },
            { label: "Unlimited Documents" },
            { label: "Priority Support" },
        ],
    },
];
