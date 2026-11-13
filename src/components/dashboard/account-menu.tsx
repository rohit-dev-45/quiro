"use client";

import { LogOutIcon, LucideIcon } from "lucide-react";
import { ComponentProps, ReactNode, useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SessionUser, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserAvatar } from "../auth/user-avatar";
import Link from "next/link";

type AccountMenuItem = {
    href: string;
    label: string;
    icon: LucideIcon;
};

function AccountMenu({
    user,
    items = [],
    render,
    children,
    className,
    ...contentProps
}: ComponentProps<typeof DropdownMenuContent> & {
    user: SessionUser;
    items?: AccountMenuItem[];
    render: ComponentProps<typeof DropdownMenuTrigger>["render"];
    children: ReactNode;
}) {
    const router = useRouter();
    const [pending, setPending] = useState(false);

    async function handleSignOut() {
        setPending(true);
        await signOut();
        router.replace("/");
        router.refresh();
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={render}>
                {children}
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className={cn("w-64 p-1.5", className)}
                {...contentProps}
            >
                <div className="flex items-center gap-3 px-1.5 py-2">
                    <UserAvatar user={user} className="size-9" />
                    <div className="flex min-w-0 flex-col">
                        {user.name && (
                            <span className="truncate text-sm font-semibold">
                                {user.name}
                            </span>
                        )}
                        <span className="truncate text-sm text-muted-foreground">
                            {user.email}
                        </span>
                    </div>
                </div>

                <DropdownMenuSeparator />

                {items.map((item) => (
                    <DropdownMenuItem
                        key={item.href}
                        render={<Link href={item.href} />}
                        className="cursor-pointer gap-2.5 px-1.5 py-2"
                    >
                        <item.icon />
                        {item.label}
                    </DropdownMenuItem>
                ))}

                {items.length > 0 && <DropdownMenuSeparator />}

                <DropdownMenuItem
                    disabled={pending}
                    onClick={handleSignOut}
                    className="cursor-pointer gap-2.5 px-1.5 py-2"
                >
                    <LogOutIcon />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export { AccountMenu, type AccountMenuItem };
