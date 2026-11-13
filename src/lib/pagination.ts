export function pageNumbers(
    page: number,
    pageCount: number,
): (number | "ellipsis")[] {
    if (pageCount <= 7) {
        return Array.from({ length: pageCount }, (_, index) => index + 1);
    }

    const wanted = [1, page - 1, page, page + 1, pageCount]
        .filter((number) => number >= 1 && number <= pageCount)
        .sort((a, b) => a - b);

    const numbers: (number | "ellipsis")[] = [];
    let previous = 0;

    for (const number of wanted) {
        if (number === previous) continue;
        if (previous && number - previous > 1) numbers.push("ellipsis");

        numbers.push(number);
        previous = number;
    }

    return numbers;
}

export function clampPage(page: number, total: number, pageSize: number) {
    const pageCount = Math.max(1, Math.ceil(total / pageSize));

    return { page: Math.min(Math.max(1, page), pageCount), pageCount };
}

export function rangeLabel({
    page,
    total,
    pageSize,
    noun,
}: {
    page: number;
    total: number;
    pageSize: number;
    noun: string;
}) {
    if (total === 0) return `No ${noun}s`;

    const first = (page - 1) * pageSize + 1;
    const last = Math.min(page * pageSize, total);

    return `${first}–${last} Of ${total} ${noun}${total === 1 ? "" : "s"}`;
}
