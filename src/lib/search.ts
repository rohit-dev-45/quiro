import { APP_ROOT } from "./dashboard-nav";

export const SEARCH_ROUTE = `${APP_ROOT}/search`;

export const SEARCH_PAGE_SIZE = 5;

export const SEARCH_QUERY_MAX = 200;

const MAX_TERMS = 12;

const MIN_PREFIX_STEM = 4;

const STOPWORDS = new Set([
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "that",
    "the",
    "this",
    "to",
    "was",
    "were",
    "with",
]);

const SUFFIXES = [
    "ational",
    "iveness",
    "fulness",
    "ization",
    "ations",
    "ration",
    "ement",
    "ation",
    "ities",
    "ively",
    "ingly",
    "ments",
    "ology",
    "ances",
    "ences",
    "ment",
    "ness",
    "tion",
    "sion",
    "ance",
    "ence",
    "able",
    "ible",
    "ing",
    "ies",
    "ive",
    "ity",
    "ers",
    "ed",
    "es",
    "ly",
    "s",
];

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function stemWord(word: string) {
    for (const suffix of SUFFIXES) {
        if (
            word.length >= suffix.length + MIN_PREFIX_STEM &&
            word.endsWith(suffix)
        ) {
            return word.slice(0, -suffix.length);
        }
    }

    return word;
}

export type SearchStem = {
    word: string;
    stem: string;
    prefix: boolean;
};

export function searchStems(query: string): SearchStem[] {
    const words = query
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((word) => word.length > 1);

    const meaningful = words.filter((word) => !STOPWORDS.has(word));
    const chosen = meaningful.length > 0 ? meaningful : words;

    const seen = new Set<string>();
    const stems: SearchStem[] = [];

    for (const word of chosen) {
        const stem = stemWord(word);
        if (seen.has(stem)) continue;

        seen.add(stem);
        stems.push({ word, stem, prefix: stem.length >= MIN_PREFIX_STEM });

        if (stems.length === MAX_TERMS) break;
    }

    return stems;
}

function matchPattern(stems: SearchStem[]) {
    const alternatives = stems.map(({ stem, prefix }) =>
        prefix ? `${escapeRegExp(stem)}\\p{L}{0,6}` : escapeRegExp(stem),
    );

    return new RegExp(
        `(?<![\\p{L}\\p{N}])(?:${alternatives.join("|")})(?![\\p{L}\\p{N}])`,
        "giu",
    );
}

const MIN_PASSAGE = 180;
const MAX_PASSAGE = 700;

function chunkSentences(block: string) {
    const chunks: string[] = [];
    let current = "";

    for (const sentence of block.split(/(?<=[.!?])\s+/)) {
        if (current && current.length + sentence.length + 1 > MAX_PASSAGE) {
            chunks.push(current);
            current = "";
        }

        current = current ? `${current} ${sentence}` : sentence;
    }

    if (current) chunks.push(current);

    return chunks;
}

export function splitPassages(text: string): string[] {
    const blocks = text
        .split(/\n{2,}/)
        .map((block) => block.replace(/\s+/g, " ").trim())
        .filter(Boolean);

    const passages: string[] = [];
    let buffer = "";

    const flush = () => {
        if (buffer) passages.push(buffer);
        buffer = "";
    };

    for (const block of blocks) {
        if (block.length > MAX_PASSAGE) {
            flush();
            passages.push(...chunkSentences(block));
            continue;
        }

        buffer = buffer ? `${buffer} ${block}` : block;
        if (buffer.length >= MIN_PASSAGE) flush();
    }

    flush();

    return passages;
}

type Match = { start: number; end: number; stem: string };

function findMatches(passage: string, stems: SearchStem[]): Match[] {
    const pattern = matchPattern(stems);
    const matches: Match[] = [];

    for (const found of passage.matchAll(pattern)) {
        const text = found[0].toLowerCase();
        const stem =
            stems.find(({ stem, prefix }) =>
                prefix ? text.startsWith(stem) : text === stem,
            )?.stem ?? text;

        matches.push({
            start: found.index,
            end: found.index + found[0].length,
            stem,
        });
    }

    return matches;
}

const WINDOW_CHARS = 120;

function bestWindow(matches: Match[]) {
    let best = { start: matches[0].start, end: matches[0].end, stems: 0 };

    for (let index = 0; index < matches.length; index += 1) {
        const stems = new Set<string>();
        let end = matches[index].end;

        for (let ahead = index; ahead < matches.length; ahead += 1) {
            if (matches[ahead].end - matches[index].start > WINDOW_CHARS) break;

            stems.add(matches[ahead].stem);
            end = matches[ahead].end;
        }

        if (stems.size > best.stems) {
            best = { start: matches[index].start, end, stems: stems.size };
        }
    }

    return best;
}

export type SearchSegment = { text: string; match: boolean };

export type SearchPassageView = {
    id: string;
    documentId: string;
    documentName: string;
    format: string;
    page: number | null;
    score: number;
    segments: SearchSegment[];
    clippedStart: boolean;
    clippedEnd: boolean;
};

const SNIPPET_CHARS = 260;

function toWordBoundary(text: string, index: number, direction: -1 | 1) {
    let cursor = index;

    while (
        cursor > 0 &&
        cursor < text.length &&
        /[\p{L}\p{N}]/u.test(text[cursor - 1])
    ) {
        cursor += direction;
    }

    return Math.min(Math.max(cursor, 0), text.length);
}

export function scorePassage(passage: string, stems: SearchStem[]) {
    const matches = findMatches(passage, stems);
    if (matches.length === 0) return null;

    const distinct = new Set(matches.map((match) => match.stem)).size;
    const window = bestWindow(matches);

    const coverage = distinct / stems.length;
    const proximity = window.stems / stems.length;
    const density = Math.min(1, matches.length / (stems.length * 2));
    const score = 0.6 * coverage + 0.3 * proximity + 0.1 * density;

    const spare = Math.max(0, SNIPPET_CHARS - (window.end - window.start));
    const from = toWordBoundary(
        passage,
        Math.max(0, window.start - Math.floor(spare / 2)),
        -1,
    );
    const to = toWordBoundary(
        passage,
        Math.min(passage.length, from + SNIPPET_CHARS),
        1,
    );

    const segments: SearchSegment[] = [];
    let cursor = from;

    for (const match of matches) {
        if (match.start < from || match.end > to) continue;
        if (match.start > cursor) {
            segments.push({
                text: passage.slice(cursor, match.start),
                match: false,
            });
        }

        segments.push({
            text: passage.slice(match.start, match.end),
            match: true,
        });
        cursor = match.end;
    }

    if (cursor < to) {
        segments.push({ text: passage.slice(cursor, to), match: false });
    }

    return {
        score: Math.round(score * 100),
        segments,
        clippedStart: from > 0,
        clippedEnd: to < passage.length,
    };
}

export type SearchScopeView = {
    value: string;
    label: string;
    count: number;
};

export type SearchResultsView = {
    passages: SearchPassageView[];
    total: number;
    documentCount: number;
    page: number;
    pageCount: number;
};

export function toSearchScope(
    value: string | undefined,
    scopes: SearchScopeView[],
) {
    return scopes.some((scope) => scope.value === value) ? value! : "all";
}

export function searchHref({
    query = "",
    scope = "all",
    page = 1,
}: {
    query?: string;
    scope?: string;
    page?: number;
} = {}) {
    const params = new URLSearchParams();

    if (query.trim()) params.set("q", query.trim());
    if (scope !== "all") params.set("scope", scope);
    if (page > 1) params.set("page", String(page));

    const search = params.toString();

    return search ? `${SEARCH_ROUTE}?${search}` : SEARCH_ROUTE;
}
