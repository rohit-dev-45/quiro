import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";

import { formatBytes } from "@/lib/chat";

export const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024;

export const MAX_DOCUMENT_CHARS = 300_000;

const PDF_TYPE = "application/pdf";
const DOCX_TYPE =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type DocumentKind = "pdf" | "docx" | "text";

type DocumentType = { kind: DocumentKind; format: string };

const BY_CONTENT_TYPE: Record<string, DocumentType> = {
    [PDF_TYPE]: { kind: "pdf", format: "PDF" },
    [DOCX_TYPE]: { kind: "docx", format: "DOCX" },
    "text/plain": { kind: "text", format: "TXT" },
    "text/markdown": { kind: "text", format: "MD" },
};

const BY_EXTENSION: Record<string, DocumentType> = {
    pdf: { kind: "pdf", format: "PDF" },
    docx: { kind: "docx", format: "DOCX" },
    txt: { kind: "text", format: "TXT" },
    md: { kind: "text", format: "MD" },
};

export function classifyDocument(
    name: string,
    contentType: string,
): DocumentType | null {
    const byType = BY_CONTENT_TYPE[contentType.split(";")[0].trim()];
    if (byType) return byType;

    const extension = name.split(".").pop()?.toLowerCase() ?? "";

    return BY_EXTENSION[extension] ?? null;
}

export type ExtractedDocument = {
    text: string;
    pageCount: number | null;
};

async function extractPdf(bytes: Buffer): Promise<ExtractedDocument> {
    const pdf = await getDocumentProxy(new Uint8Array(bytes));
    const { totalPages, text } = await extractText(pdf, { mergePages: false });

    const hasText = text.some((page) => page.trim());
    if (!hasText) return { text: "", pageCount: totalPages };

    const tagged = text
        .map((page, index) => `[Page ${index + 1}]\n${page.trim()}`)
        .join("\n\n");

    return { text: tagged, pageCount: totalPages };
}

export async function extractDocument(
    bytes: Buffer,
    kind: DocumentKind,
): Promise<ExtractedDocument> {
    let result: ExtractedDocument;

    if (kind === "pdf") {
        result = await extractPdf(bytes);
    } else if (kind === "docx") {
        result = {
            text: (await mammoth.extractRawText({ buffer: bytes })).value,
            pageCount: null,
        };
    } else {
        result = { text: bytes.toString("utf8"), pageCount: null };
    }

    if (!result.text.trim()) {
        throw new Error(
            "That File Has No Readable Text. If It's A Scan, It Needs OCR Before It Can Be Read.",
        );
    }

    if (result.text.length > MAX_DOCUMENT_CHARS) {
        throw new Error(
            "That File Is Too Long To Read In One Go. Try A Shorter Document Or Split It Up.",
        );
    }

    return result;
}

export function documentMeta(sizeBytes: number, pageCount: number | null) {
    const size = formatBytes(sizeBytes);

    return pageCount ? `${size} · ${pageCount} pages` : size;
}

export type DocumentPayload = {
    id: string;
    name: string;
    text: string;
};

export function toDocumentContext(document: DocumentPayload): string {
    return `<document id="${document.id}" name="${document.name}">\n${document.text}\n</document>`;
}

export const CITATION_INSTRUCTIONS =
    "Answer Using Only The Provided Documents. When You State A Fact From A Document, " +
    "Cite It As [Document Name, P. N] Using The [Page N] Markers In The Text. " +
    "If The Answer Isn't In The Documents, Say So.";
