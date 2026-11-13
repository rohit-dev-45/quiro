export function organizationSlug(name: string) {
    const slug = name
        .normalize("NFKD")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48);

    return slug || "workspace";
}

export function uniqueSlugSuffix() {
    return Math.random().toString(36).slice(2, 6);
}
