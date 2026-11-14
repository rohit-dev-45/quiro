"use client";

import {
    BILLING_ROUTE,
    DANGER_ZONE_ROUTE,
    SETTINGS_ROUTE,
} from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SETTINGS_TABS = [
    { href: SETTINGS_ROUTE, label: "Account" },
    { href: BILLING_ROUTE, label: "Billing" },
    { href: DANGER_ZONE_ROUTE, label: "Danger Zone" },
];

function SettingsTabs() {
    const pathname = usePathname();

    return (
        <nav
            aria-label="Settings sections"
            className="inline-flex h-8 w-fit items-center justify-center rounded-lg bg-muted p-0.75 text-muted-foreground"
        >
            {SETTINGS_TABS.map((tab) => {
                const isActive = pathname === tab.href;

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                            "inline-flex h-[calc(100%-1px)] items-center justify-center rounded-md border border-transparent px-3.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                            isActive &&
                                "bg-background text-foreground shadow-sm dark:border-input dark:bg-input/30",
                        )}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </nav>
    );
}

export { SettingsTabs };
