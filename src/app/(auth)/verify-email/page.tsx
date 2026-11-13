import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";

type VerifyEmailPageProps = {
    searchParams: Promise<{
        email?: string | string[];
    }>;
};

export default async function VerifyEmailPage({
    searchParams,
}: VerifyEmailPageProps) {
    const params = await searchParams;

    const email = Array.isArray(params.email) ? params.email[0] : params.email;

    return (
        <main className="flex items-center justify-center bg-background px-5 py-4">
            <div className="flex w-full max-w-sm flex-col items-center text-center">
                {/* Verification Content */}
                <div className="flex w-full flex-col items-center">
                    <div className="mt-8 mb-5 flex size-14 items-center justify-center rounded-2xl border bg-card shadow-sm">
                        <MailCheck
                            className="size-6 text-primary"
                            strokeWidth={1.6}
                        />
                    </div>

                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        Check Your Inbox
                    </h1>

                    <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                        We've Sent You A Verification Link To Confirm Your Email
                        Address And Finish Setting Up Your Account.
                    </p>

                    {email && (
                        <div className="mt-5 max-w-full rounded-full border bg-muted/40 px-4 py-2">
                            <p
                                className="truncate text-sm font-medium"
                                title={email}
                            >
                                {email}
                            </p>
                        </div>
                    )}

                    <p className="mt-5 max-w-xs text-sm leading-6 text-muted-foreground">
                        Didn't Receive The Email? Check Your Spam Folder Or Give
                        It A Moment To Arrive.
                    </p>

                    <Link
                        href="/"
                        className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors hover:bg-accent"
                    >
                        <ArrowLeft className="size-4" />
                        Back To Home
                    </Link>
                </div>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary" />
                    <p className="text-xs text-muted-foreground">
                        Secure Your Account With Quiro
                    </p>
                </div>
            </div>
        </main>
    );
}
