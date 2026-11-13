import { ArrowRightIcon } from "lucide-react";
import { Button } from "../ui/button";
import { AuthDialogTrigger } from "../auth/auth-dialog-trigger";

export function FooterCTA() {
    return (
        <section className="mx-auto w-full max-w-6xl px-6 py-8 lg:py-12">
            <div className="surface-inverted relative overflow-hidden rounded-3xl bg-background text-foreground">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-radial-[at_50%_0%] from-brand/20 to-transparent to-65%"
                />

                <div className="relative flex flex-col items-center gap-6 px-6 py-20 text-center">
                    <h2 className="text-4xl leading-[1.05] font-bold tracking-tight sm:text-5xl">
                        <span className="block">Stop Skimming.</span>
                        <span className="block">Start Asking.</span>
                    </h2>

                    <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
                        Upload Your First Documents And Get Cited Answers In
                        Minutes. Free For 5 Files — No Card Required.
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <AuthDialogTrigger
                            mode="sign-up"
                            className="h-11 bg-brand px-5 text-base text-brand-foreground hover:bg-brand/90 has-data-[icon=inline-end]:pr-5"
                        >
                            Try Quiro Free
                            <ArrowRightIcon data-icon="inline-end" />
                        </AuthDialogTrigger>
                        <Button
                            variant="outline"
                            className="h-11 px-5 text-base"
                        >
                            Try The ⌘K Search
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
