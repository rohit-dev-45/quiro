type AuthError = {
    code?: string;
    message?: string;
    status?: number;
} | null;

const MESSAGES: Record<string, string> = {
    INVALID_EMAIL_OR_PASSWORD:
        "That Email And Password Don't Match An Account.",
    USER_ALREADY_EXISTS: "An Account With That Email Already Exists.",
    EMAIL_NOT_VERIFIED:
        "Confirm Your Email Address First — Check Your Inbox For The Link.",
    PASSWORD_TOO_SHORT: "Passwords Need To Be At Least 8 Characters.",
    PASSWORD_TOO_LONG: "That Password Is Too Long.",
    INVALID_TOKEN: "That Link Is Invalid Or Has Already Been Used.",
    INVALID_EMAIL: "Enter A Valid Email Address.",
    INVALID_PASSWORD: "That Password Doesn't Match This Account.",
    SESSION_EXPIRED: "Sign Out And Sign Back In, Then Try That Again.",
};

export function authErrorMessage(error: AuthError, fallback: string) {
    if (!error) return fallback;

    if (error.status === 429) {
        return "Too Many Attempts. Wait a Minute And Try Again.";
    }

    if (error.code && MESSAGES[error.code]) {
        return MESSAGES[error.code];
    }

    return error.message || fallback;
}
