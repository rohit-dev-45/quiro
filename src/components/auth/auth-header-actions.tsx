"use client";

import { useSession } from "@/lib/auth-client";
import { Skeleton } from "../ui/skeleton";
import { UserMenu } from "./user-menu";
import { AuthDialogTrigger } from "./auth-dialog-trigger";

function AuthHeaderActions() {
    const { data: session, isPending } = useSession();

    if (isPending) {
        return <Skeleton className="hidden h-8 w-40 rounded-lg md:block" />;
    }

    if (session) {
        return <UserMenu user={session.user} />;
    }

    return (
        <div className="hidden items-center gap-2 md:flex">
            <AuthDialogTrigger mode="sign-in" variant="ghost">
                Sign In
            </AuthDialogTrigger>
            <AuthDialogTrigger mode="sign-up">Try Quiro Free</AuthDialogTrigger>
        </div>
    );
}

export { AuthHeaderActions };
