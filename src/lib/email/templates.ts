export type EmailTemplateParams = {
    to_email: string;
    subject: string;
    app_name: string;
    preheader: string;
    heading: string;
    message: string;
    action_label: string;
    action_url: string;
    footnote: string;
    app_url: string;
    reply_to: string;
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const REPLY_TO = process.env.EMAIL_REPLY_TO ?? "";

function baseTemplate({
    to,
    subject,
    preheader,
    heading,
    message,
    action,
    url,
    footnote,
}: {
    to: string;
    subject: string;
    preheader: string;
    heading: string;
    message: string;
    action: string;
    url: string;
    footnote: string;
}): EmailTemplateParams {
    return {
        to_email: to,
        subject,
        app_name: "Quiro",
        preheader,
        heading,
        message,
        action_label: action,
        action_url: url,
        footnote,
        app_url: APP_URL,
        reply_to: REPLY_TO,
    };
}

export function verificationEmail(
    to: string,
    url: string,
): EmailTemplateParams {
    return baseTemplate({
        to,
        subject: `Verify Your Email Address | Quiro`,
        preheader: "One Quick Step To Activate Your Account.",
        heading: "Welcome To Quiro!",
        message:
            `Thanks For Choosing Quiro. ` +
            "Please Verify Your Email Address To Activate Your Account " +
            "And Start Exploring Your AI-Powered Document Workspace.",
        action: "Verify My Email",
        url,
        footnote:
            "This Verification Link Expires In 1 Hour. " +
            "If You Didn't Create An Account, You Can Safely Ignore This Email.",
    });
}

export function changeEmailVerificationEmail(
    to: string,
    previousEmail: string,
    url: string,
): EmailTemplateParams {
    return baseTemplate({
        to,
        subject: `Confirm Your New Email | Quiro`,
        preheader: "Confirm Your New Email Address.",
        heading: "Confirm Your New Email",
        message:
            `You Requested To Change Your Quiro Account Email ` +
            `From ${previousEmail} To ${to}. ` +
            "Confirm Your New Address To Complete This Change.",
        action: "Confirm New Email",
        url,
        footnote:
            "This Link Expires In 1 Hour. If You Didn't Request This Change, " +
            "Ignore This Email. Your Existing Account Email Will Remain Unchanged.",
    });
}

export function passwordResetEmail(
    to: string,
    url: string,
): EmailTemplateParams {
    return baseTemplate({
        to,
        subject: `Reset Your Password | Quiro`,
        preheader: "Securely Reset Your Account Password.",
        heading: "Forgot Your Password?",
        message:
            `We Received A Request To Reset The Password For Your ` +
            `Quiro Account. No Worries, It Happens! ` +
            "Click The Button Below To Choose A New Password.",
        action: "Reset My Password",
        url,
        footnote:
            "This Password Reset Link Expires In 1 Hour And Can Only Be " +
            "Used Once. If You Didn't Request A Password Reset, Your Password " +
            "Remains Unchanged. You Can Safely Ignore This Email.",
    });
}
