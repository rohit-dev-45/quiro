import { cn } from "@/lib/utils";
import { SpinnerRing } from "../common/spinner-ring";

function OrganizationSetupLoading({
    name,
    className,
}: {
    name: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24",
                className,
            )}
        >
            <SpinnerRing
                aria-label={`Setting up ${name}`}
                className="size-8 border-muted border-t-brand"
            />
            <p className="text-muted-foreground">Setting Up {name}…</p>
        </div>
    );
}

export { OrganizationSetupLoading };
