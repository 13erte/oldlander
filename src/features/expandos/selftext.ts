/**
 * Helpers for getting at a post's selftext, used both by the inline text expando
 * on comment pages and by the gallery caption on listing pages.
 * https://github.com/OctoNezd/oldlander/issues/171
 */

/** Marks our own injected copy so it is never mistaken for one of reddit's. */
export const INJECTED_SELFTEXT_CLASS = "ol-text-expando";

/**
 * The selftext reddit is already showing for this post, as HTML, or an empty
 * string when there is none on the page.
 *
 * Reddit puts it in two different places depending on the page: inside the media
 * expando on listings, and directly in the post's entry on comment pages. Both
 * have to count — checking only the expando meant a second copy got injected
 * right next to the one reddit was already rendering.
 *
 * `post.dataset.selftext` deliberately is not used here: it is populated by the
 * posts feature, which runs *after* the expandos feature, so it is always empty
 * at the point these checks happen.
 */
export function getRenderedSelftext(post: HTMLDivElement): string {
    const bodies = post.querySelectorAll<HTMLElement>(
        `.usertext-body:not(.${INJECTED_SELFTEXT_CLASS})`,
    );
    for (const body of bodies) {
        // An expando reddit has not initialized yet is not showing anything.
        const expando = body.closest(".expando");
        if (expando !== null && expando.classList.contains("expando-uninitialized")) {
            continue;
        }
        // textContent rather than innerText: presence must not depend on layout.
        if ((body.textContent ?? "").trim() !== "") {
            return body.innerHTML;
        }
    }
    return "";
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

/** Block-level tags whose boundaries stand in for line breaks in reddit markup. */
const BLOCK_TAGS = "p, div, br, li, blockquote, pre, h1, h2, h3, h4, h5, h6";

/**
 * A post's selftext as plain text, for surfaces that render captions as text
 * rather than markup (the gallery caption escapes whatever it is given, so
 * handing it HTML shows the raw tags).
 */
export async function getSelftextText(post: HTMLDivElement): Promise<string> {
    const html = await getSelftext(post);
    if (html === "") {
        return "";
    }
    const doc = new DOMParser().parseFromString(html, "text/html");
    // textContent alone would run paragraphs together, and drops reddit's
    // <!-- SC_OFF --> markers for free.
    doc.body
        .querySelectorAll(BLOCK_TAGS)
        .forEach((element) => element.after(document.createTextNode("\n")));
    return (doc.body.textContent ?? "").replace(/\n{3,}/g, "\n\n").trim();
}
