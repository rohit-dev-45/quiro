import { WrenchIcon } from "lucide-react";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "../ui/empty";

function MaintenanceNotice() {
    return (
        <div className="flex min-h-svh items-center justify-center p-6">
            <Empty className="max-w-120">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <WrenchIcon />
                    </EmptyMedia>
                    <EmptyTitle>Quiro Is Down For Maintenance</EmptyTitle>
                    <EmptyDescription>
                        We&apos;re Making Some Changes And Will Be Back Shortly.
                        Your Documents And Chats Are Untouched — Nothing Is
                        Being Deleted.
                    </EmptyDescription>
                </EmptyHeader>

                <EmptyContent>
                    <p className="text-sm text-muted-foreground">
                        Already Signed In? You&apos;ll Pick Up Exactly Where You
                        Left Off.
                    </p>
                </EmptyContent>
            </Empty>
        </div>
    );
}

export { MaintenanceNotice };
