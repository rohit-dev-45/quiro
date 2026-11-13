export type AppSettings = {
    allowSignUps: boolean;
    enforceTwoFactor: boolean;
    maintenanceMode: boolean;
    chatRetentionMonths: number | null;
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
    allowSignUps: true,
    enforceTwoFactor: false,
    maintenanceMode: false,
    chatRetentionMonths: 12,
};

export const RETENTION_OPTIONS: { value: string; label: string }[] = [
    { value: "3", label: "3 Months" },
    { value: "6", label: "6 Months" },
    { value: "12", label: "12 Months" },
    { value: "24", label: "24 Months" },
    { value: "never", label: "Keep For Ever" },
];

export function retentionToValue(months: number | null) {
    return months === null ? "never" : String(months);
}

export function retentionFromValue(value: string): number | null {
    if (value === "never") return null;

    const months = Number.parseInt(value, 10);

    return Number.isFinite(months) && months > 0 ? months : null;
}

export type ToggleSettingKey =
    "enforceTwoFactor" | "allowSignUps" | "maintenanceMode";

export type ToggleSetting = {
    key: ToggleSettingKey;
    title: string;
    description: string;
    unavailable?: string;
};

export const TOGGLE_SETTINGS: ToggleSetting[] = [
    {
        key: "enforceTwoFactor",
        title: "Enforce Two-Factor Authentication",
        description: "Every User Must Enable 2FA To Access The App.",
        unavailable:
            "Quiro Doesn't Offer Two-Factor Sign-In Yet, So There's Nothing To Enforce.",
    },
    {
        key: "allowSignUps",
        title: "Allow New Sign-Ups",
        description: "Let New People Register From The Marketing Site.",
    },
    {
        key: "maintenanceMode",
        title: "Maintenance Mode",
        description:
            "Temporarily Take The App Offline For Everyone But Admins.",
    },
];
