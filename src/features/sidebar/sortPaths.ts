/**
 * Pure URL helpers for the sidebar's feed sorting. Kept free of DOM access so
 * the path rules can be reasoned about (and exercised) on their own.
 * https://github.com/OctoNezd/oldlander/issues/35
 */

/** Sort segments reddit accepts in a feed URL. */
const SORT_SEGMENTS = [
    "hot",
    "new",
    "top",
    "rising",
    "controversial",
    "best",
];

/** Reddit shows the hot feed when a listing URL carries no sort segment. */
export const DEFAULT_SORT = "hot";

function pathSegments(pathname: string) {
    return pathname.split("/").filter((segment) => segment.length > 0);
}

/**
 * The feed path that sort links should be built from, or undefined when the
 * current page is not a sortable listing (comment threads, user pages,
 * preferences, messages, search, ...).
 *
 * Returns an empty string for the front page, so callers can build `/new/`.
 */
export function getSortableFeedBase(pathname: string): string | undefined {
    const segments = pathSegments(pathname);

    // Front page: "/" or an already-sorted "/top/".
    if (segments.length === 0) {
        return "";
    }
    if (segments.length === 1 && SORT_SEGMENTS.includes(segments[0])) {
        return "";
    }

    // Subreddit listing: "/r/sub" or an already-sorted "/r/sub/top".
    if (segments[0] === "r" && segments.length >= 2) {
        const base = `/r/${segments[1]}`;
        if (segments.length === 2) {
            return base;
        }
        if (segments.length === 3 && SORT_SEGMENTS.includes(segments[2])) {
            return base;
        }
    }

    return undefined;
}

/** The sort the current URL is showing, falling back to reddit's default. */
export function getCurrentSort(pathname: string): string {
    const segments = pathSegments(pathname);
    const lastSegment = segments[segments.length - 1];
    return lastSegment && SORT_SEGMENTS.includes(lastSegment)
        ? lastSegment
        : DEFAULT_SORT;
}
