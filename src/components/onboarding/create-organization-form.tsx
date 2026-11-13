"use client";

import { organization } from "@/lib/auth-client";
import { APP_ROOT } from "@/lib/dashboard-nav";
import { organizationSlug, uniqueSlugSuffix } from "@/lib/organization";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authErrorMessage } from "../auth/auth-errors";
import { OrganizationSetupLoading } from "./organization-setup-loading";
import { QuiroMark } from "../brand/docsy-logo";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ArrowRightIcon } from "lucide-react";

const SLUG_TAKEN = new Set([
    "ORGANIZATION_ALREADY_EXISTS",
    "ORGANIZATION_SLUG_ALREADY_TAKEN",
]);
const SLUG_ATTEMPTS = 3;

function CreateOrganizationForm() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const workspace = name.trim();
        if (!workspace) return;

        setPending(true);
        setError(null);

        const base = organizationSlug(workspace);

        for (let attempt = 0; attempt < SLUG_ATTEMPTS; attempt++) {
            const { error: createError } = await organization.create({
                name: workspace,
                slug: attempt === 0 ? base : `${base}-${uniqueSlugSuffix()}`,
            });

            if (!createError) {
                router.replace(APP_ROOT);
                router.refresh();
                return;
            }

            if (!createError.code || !SLUG_TAKEN.has(createError.code)) {
                setPending(false);
                setError(
                    authErrorMessage(
                        createError,
                        "Could Not Create Your Workspace.",
                    ),
                );
                return;
            }
        }

        setPending(false);
        setError("That Name Is Taken. Try a Different One.");
    }

    if (pending) {
        return <OrganizationSetupLoading name={name.trim()} />;
    }

    return (
        <div className="mx-auto w-full max-w-md px-6 pt-24 pb-16">
            <QuiroMark className="size-12" />

            <h1 className="mt-6 font-heading text-3xl font-bold tracking-tight">
                Name Your Organization
            </h1>
            <p className="mt-3 leading-relaxed text-muted-foreground">
                This Is Your Workspace For Documents, Chats, And Teammates. You
                Can Change It Later In Settings.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
                {error && (
                    <p
                        role="alert"
                        className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    >
                        {error}
                    </p>
                )}

                <Field>
                    <FieldLabel htmlFor="organization-name">
                        Organization Name
                    </FieldLabel>
                    <Input
                        id="organization-name"
                        name="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="e.g. Meridian Capital"
                        autoComplete="organization"
                        autoFocus
                        required
                        maxLength={64}
                        className="h-11"
                    />
                </Field>

                <Button
                    type="submit"
                    disabled={!name.trim()}
                    className="h-11 w-full cursor-pointer gap-2 text-sm font-medium"
                >
                    Continue
                    <ArrowRightIcon />
                </Button>
            </form>
        </div>
    );
}

export { CreateOrganizationForm };
