export const AVATAR_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export const AVATAR_MAX_DIMENSION = 512;

const SIGNATURES: { type: string; bytes: number[]; offset?: number }[] = [
    { type: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
    { type: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
    { type: "image/webp", bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 },
];

export function sniffImageType(bytes: Uint8Array) {
    const match = SIGNATURES.find(({ bytes: signature, offset = 0 }) =>
        signature.every((byte, index) => bytes[offset + index] === byte),
    );

    return match?.type ?? null;
}

export function avatarUrl(userId: string, version: number | Date) {
    const stamp = version instanceof Date ? version.getTime() : version;

    return `/api/avatar/${userId}?v=${stamp}`;
}
