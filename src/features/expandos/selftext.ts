/**
 * Helpers for getting at a post's selftext, used both by the inline text expando
 * on comment pages and by the gallery caption on listing pages.
 * https://github.com/OctoNezd/oldlander/issues/171
 */

/**
 * The selftext reddit has already rendered into the post's native expando, as
 * HTML. Empty when the post has no selftext, or when its expando has not been
 * initialized yet (which is the case while "auto expand media previews" is off).
 *
 * `post.dataset.selftext` deliberately is not used here: it is populated by the
 * posts feature, which runs *after* the expandos feature, so it is always empty
 * at the point these checks happen.
 */
export function getRenderedSelftext(post: HTMLDivElement): string {
    const expando = post.querySelector<HTMLDivElement>(".expando");
    if (!expando || expando.classList.contains("expando-uninitialized")) {
        return "";
    }
    const body = expando.querySelector<HTMLElement>(".usertext-body");
    if (!body || body.innerText.trim() === "") {
        return "";
    }
    return body.innerHTML;
}

/**
 * Fetches the post's selftext from reddit's JSON API, as HTML. Returns an empty
 * string when the post has no selftext or the lookup fails.
 */
export async function fetchSelftext(post: HTMLDivElement): Promise<string> {
    const fullname = post.dataset.fullname;
    if (!fullname) {
        return "";
    }
    const metaUrl = `${location.protocol}//${location.host}/by_id/${fullname}.json`;
    try {
        const response = await fetch(metaUrl, {
            credentials: "include",
            mode: "cors",
            cache: "no-store",
        });
        if (!response.ok) {
            throw new Error(`reddit responded with ${response.status}`);
        }
        const meta = await response.json();
        const selftextHtml = meta?.data?.children?.[0]?.data?.selftext_html;
        if (typeof selftextHtml !== "string") {
            return "";
        }
        // reddit escapes the markup, so it has to be unescaped before use.
        const doc = new DOMParser().parseFromString(selftextHtml, "text/html");
        const unescaped = doc.documentElement.textContent;
        if (unescaped === null || unescaped === "null") {
            return "";
        }
        return unescaped;
    } catch (error) {
        console.error("Failed to fetch selftext for", fullname, error);
        return "";
    }
}

/**
 * Drops `injected` if reddit's own expando initializes with the text later on.
 *
 * The expandos feature runs before reddit has necessarily expanded a post, so a
 * copy can legitimately be injected and only then be made redundant. Without
 * this the text would show twice, which is the original bug.
 */
export function removeWhenNativeSelftextAppears(
    post: HTMLDivElement,
    injected: HTMLElement,
) {
    const expando = post.querySelector<HTMLDivElement>(".expando");
    if (!expando || !expando.classList.contains("expando-uninitialized")) {
        return;
    }
    const observer = new MutationObserver(() => {
        if (expando.classList.contains("expando-uninitialized")) {
            return;
        }
        observer.disconnect();
        if (getRenderedSelftext(post) !== "") {
            injected.remove();
        }
    });
    observer.observe(expando, {
        attributes: true,
        attributeFilter: ["class"],
    });
}

/**
 * A post's selftext as HTML, preferring what is already on the page so that the
 * common case costs no request.
 */
export async function getSelftext(post: HTMLDivElement): Promise<string> {
    const rendered = getRenderedSelftext(post);
    if (rendered !== "") {
        return rendered;
    }
    return await fetchSelftext(post);
}
