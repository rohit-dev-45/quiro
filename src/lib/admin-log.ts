import type { PlanId } from "@/lib/billing";
import { planName } from "@/lib/billing";

export const ADMIN_LOG_PAGE_SIZE = 50;

export const SYSTEM_ACTOR = "System";

export const LOG_ACTIONS = {
    userCreated: "user.created",
    userDeactivated: "user.deactivated",
    userReactivated: "user.reactivated",
    passwordResetSent: "user.password_reset_sent",
    planGranted: "plan.granted",
    settingChanged: "settings.changed",
    chatsPurged: "retention.chats_purged",
} as const;

export type LogAction = (typeof LOG_ACTIONS)[keyof typeof LOG_ACTIONS];

export type AdminLogEntry = {
    id: string;
    actor: string;
    action: string;
    description: string;
    createdAt: string;
};

export function describeUserCreated(email: string, planId: PlanId) {
    return `created user ${email} (${planName(planId)})`;
}

export function describePlanGranted(subject: string, planId: PlanId) {
    return `upgraded ${subject} to ${planName(planId)}`;
}

export function describeDeactivated(subject: string) {
    return `deactivated ${subject}`;
}

export function describeReactivated(subject: string) {
    return `reactivated ${subject}`;
}

export function describePasswordReset(email: string) {
    return `sent a password reset to ${email}`;
}

export function describeSettingChange(
    key: "maintenanceMode" | "allowSignUps" | "enforceTwoFactor",
    value: boolean,
) {
    switch (key) {
        case "maintenanceMode":
            return `${value ? "enabled" : "disabled"} Maintenance mode`;
        case "allowSignUps":
            return `turned ${value ? "on" : "off"} new sign-ups`;
        case "enforceTwoFactor":
            return `${value ? "enabled" : "disabled"} enforced two-factor authentication`;
    }
}

export function describeRetentionChange(months: number | null) {
    return months === null
        ? "turned off automatic chat deletion"
        : `set data retention to ${months} months`;
}

export function describeChatsPurged(count: number, months: number) {
    return `deleted ${count} chat${count === 1 ? "" : "s"} older than ${months} months`;
}

export function logAge(iso: string, now: Date = new Date()) {
    const seconds = Math.max(
        0,
        (now.getTime() - new Date(iso).getTime()) / 1000,
    );
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${Math.floor(minutes)}m ago`;
    if (hours < 24) return `${Math.floor(hours)}h ago`;
    if (days < 7) return `${Math.floor(days)}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;

    return `${Math.floor(days / 365)}y ago`;
}
