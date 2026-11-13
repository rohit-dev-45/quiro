import { SessionUser } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";

function userInitials(user: Pick<SessionUser, "name" | "email">) {
    const source = user.name?.trim() || user.email;

    return source
        .split(/[\s@._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

function UserAvatar({
    user,
    className,
    ...props
}: React.ComponentProps<typeof Avatar> & {
    user: Pick<SessionUser, "name" | "email" | "image">;
}) {
    return (
        <Avatar className={cn("shrink-0", className)} {...props}>
            {user.image && (
                <AvatarImage
                    src={user.image}
                    alt=""
                    referrerPolicy="no-referrer"
                />
            )}
            <AvatarFallback className="bg-brand font-medium text-brand-foreground">
                {userInitials(user)}
            </AvatarFallback>
        </Avatar>
    );
}

export { UserAvatar, userInitials };
