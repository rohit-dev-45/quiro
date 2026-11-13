import Link from "next/link";
import { QuiroLogo } from "../brand/docsy-logo";
import { mainNav } from "@/lib/site-config";
import { SearchDocsButton } from "../search/search-docs-button";
import { ThemeToggle } from "../theme-toggle";
import { MobileNav } from "./mobile-nav";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 supports-backdrop-filter:backdrop-blur-md">
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-8 px-6">
                <Link href="/" aria-label="Docsy home">
                    <QuiroLogo />
                </Link>

                <nav className="hidden items-center gap-6 md:flex">
                    {mainNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-sm text-muted-foreground transition-colors hover:text-brand"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="ml-auto flex items-center gap-2">
                    <SearchDocsButton className="hidden lg:inline-flex" />
                    <ThemeToggle />
                    <MobileNav items={mainNav} className="md:hidden" />
                </div>
            </div>
        </header>
    );
}
