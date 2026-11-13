import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toast";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
});

export const metadata: Metadata = {
    title: "Quiro — AI Document Query Engine",
    description:
        "Quiro Is An AI-Powered Document Query Engine That Lets You Upload Documents, Ask Questions In Natural Language, And Get Intelligent, Context-Aware Answers From Your Files.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={cn(
                "antialiased",
                fontMono.variable,
                "font-sans",
                geist.variable,
            )}
        >
            <body className="min-h-svh bg-background text-foreground">
                <ThemeProvider>
                    <Toaster>{children}</Toaster>
                </ThemeProvider>
            </body>
        </html>
    );
}
