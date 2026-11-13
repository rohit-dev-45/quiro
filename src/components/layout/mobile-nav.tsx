"use client";

import { useSession } from "@/lib/auth-client";
import { NavItem } from "@/lib/site-config";
import { useState } from "react";
import { AuthMode, useAuthDialog } from "../auth/auth-dialog-provider";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { MenuIcon } from "lucide-react";
import { QuiroLogo } from "../brand/docsy-logo";
import { SearchDocsButton } from "../search/search-docs-button";
import Link from "next/link";

function MobileNav({
    items,
    className,
}: {
    items: NavItem[];
    className?: string;
}) {
    const [open, setOpen] = useState(false);
    const { data: session } = useSession();
    const authDialog = useAuthDialog();

    const [queuedMode, setQueuedMode] = useState<AuthMode | null>(null);

    function requestAuth(mode: AuthMode) {
        setQueuedMode(mode);
        setOpen(false);
    }

    return (
        <Sheet
            open={open}
            onOpenChange={setOpen}
            onOpenChangeComplete={(isOpen) => {
                if (isOpen || !queuedMode) return;
                authDialog.open(queuedMode);
                setQueuedMode(null);
            }}
        >
            <SheetTrigger
                render={
                    <Button variant="ghost" size="icon" className={className} />
                }
            >
                <MenuIcon />
                <span className="sr-only">Open Menu</span>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="data-[side=right]:w-full data-[side=right]:sm:max-w-none"
            >
                <SheetHeader>
                    <SheetTitle>
                        <QuiroLogo />
                        <span className="sr-only">Quiro Navigation</span>
                    </SheetTitle>
                </SheetHeader>
                <div className="px-4">
                    <SearchDocsButton
                        className="w-full justify-start"
                        showShortcut={false}
                    />
                </div>
                <nav className="flex flex-col gap-1 px-4">
                    {items.map((item) => (
                        <SheetClose
                            key={item.href}
                            nativeButton={false}
                            render={
                                <Link
                                    href={item.href}
                                    className="rounded-lg px-2 py-2 text-base text-muted-foreground transition-colors hover:bg-muted hover:text-brand"
                                />
                            }
                        >
                            {item.label}
                        </SheetClose>
                    ))}
                </nav>
                {!session && (
                    <SheetFooter className="grid grid-cols-2">
                        <Button
                            variant="outline"
                            onClick={() => requestAuth("sign-in")}
                        >
                            Sign In
                        </Button>
                        <Button onClick={() => requestAuth("sign-up")}>
                            Try Quiro Free
                        </Button>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}

export { MobileNav };
