import { Spinner } from "@/components/ui/spinner";
import React from "react";

const Loading = () => {
    return (
        <div className="flex min-h-svh items-center justify-center">
            <Spinner className="size-6 text-muted-foreground" />
        </div>
    );
};

export default Loading;
