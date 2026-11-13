"use client";

import { SessionUser, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { UserAvatar } from "./user-avatar";
import { LogOutIcon } from "lucide-react";

function UserMenu({ user }: { user: SessionUser }) {
    const router = useRouter();
    const [pending, setPending] = useState(false);

    async function handleSignOut() {
        setPending(true);
        await signOut();
        setPending(false);
        router.refresh();
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        aria-label="Account menu"
                    />
                }
            >
                <UserAvatar user={user} size="sm" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col gap-0.5 px-1.5 py-1.5">
                    {user.name && (
                        <span className="truncate text-sm font-medium">
                            {user.name}
                        </span>
                    )}
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem disabled={pending} onClick={handleSignOut}>
                    <LogOutIcon />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export { UserMenu };
