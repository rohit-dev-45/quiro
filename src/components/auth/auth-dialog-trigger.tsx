"use client";

import { Button } from "../ui/button";
import { AuthMode, useAuthDialog } from "./auth-dialog-provider";

function AuthDialogTrigger({
    mode,
    onClick,
    ...props
}: React.ComponentProps<typeof Button> & { mode: AuthMode }) {
    const { open } = useAuthDialog();

    return (
        <Button
            {...props}
            onClick={(event) => {
                onClick?.(event);
                if (!event.defaultPrevented) open(mode);
            }}
        />
    );
}

export { AuthDialogTrigger };
