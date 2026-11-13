import emailjs from "@emailjs/nodejs";
import {
    verificationEmail,
    changeEmailVerificationEmail,
    passwordResetEmail,
    type EmailTemplateParams,
} from "./templates";

const {
    EMAILJS_SERVICE_ID,
    EMAILJS_PUBLIC_KEY,
    EMAILJS_PRIVATE_KEY,
    EMAILJS_ACCOUNT_TEMPLATE_ID,
    EMAILJS_PASSWORD_TEMPLATE_ID,
} = process.env;

const emailConfigured = Boolean(
    EMAILJS_SERVICE_ID &&
    EMAILJS_PUBLIC_KEY &&
    EMAILJS_PRIVATE_KEY &&
    EMAILJS_ACCOUNT_TEMPLATE_ID &&
    EMAILJS_PASSWORD_TEMPLATE_ID,
);

type EmailKind = "account" | "password";

async function send(content: EmailTemplateParams, kind: EmailKind) {
    if (!emailConfigured) {
        console.warn(
            "[email] EmailJS Is Not Configured. Logging Email Instead.",
            {
                to: content.to_email,
                subject: content.subject,
                url: content.action_url,
            },
        );
        return;
    }

    const templateId =
        kind === "account"
            ? EMAILJS_ACCOUNT_TEMPLATE_ID!
            : EMAILJS_PASSWORD_TEMPLATE_ID!;

    try {
        const response = await emailjs.send(
            EMAILJS_SERVICE_ID!,
            templateId,
            content,
            {
                publicKey: EMAILJS_PUBLIC_KEY!,
                privateKey: EMAILJS_PRIVATE_KEY!,
            },
        );

        console.info(`[email] Successfully Sent "${content.subject}"`, {
            status: response.status,
            text: response.text,
        });

        return response;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        console.error(`[email] Failed To Send "${content.subject}":`, message);

        throw new Error(
            `EmailJS Failed To Send "${content.subject}": ${message}`,
        );
    }
}

export function sendVerificationEmail(to: string, url: string) {
    return send(verificationEmail(to, url), "account");
}

export function sendChangeEmailVerification(
    to: string,
    previousEmail: string,
    url: string,
) {
    return send(
        changeEmailVerificationEmail(to, previousEmail, url),
        "account",
    );
}

export function sendPasswordResetEmail(to: string, url: string) {
    return send(passwordResetEmail(to, url), "password");
}
