/**
 * Shared builders for the entries in the left-hand (user) sidebar, so that the
 * individual sections can live in their own modules.
 */

/** Reddit serves both `/r/all` and `/r/all/`, so compare without the trailing slash. */
export function isCurrentPath(link: string) {
    const withoutTrailingSlash = (path: string) => path.replace(/\/+$/, "");
    return (
        withoutTrailingSlash(location.pathname) === withoutTrailingSlash(link)
    );
}

export function createSidebarItem(
    text: string,
    link: string,
    icon: string,
    isActive: boolean,
    cls?: string | Array<string>,
) {
    const item = document.createElement("a");
    if (cls !== undefined) {
        if (!Array.isArray(cls)) {
            cls = [cls];
        }
        item.classList.add(...cls);
    }
    item.href = link;
    item.classList.add("sidebar-item");

    if (icon.startsWith("http")) {
        const img = document.createElement("img");
        img.src = icon;
        img.width = 40;
        img.height = 40;
        item.prepend(img);
    } else {
        const iconEl = document.createElement("span");
        iconEl.classList.add("material-symbols-outlined", "ol-icon");
        iconEl.innerText = icon || "forum";
        item.appendChild(iconEl);
    }

    const labelEl = document.createElement("span");
    labelEl.classList.add("sidebar-text");
    labelEl.innerText = text;
    item.appendChild(labelEl);

    if (isActive) {
        item.classList.add("sidebar-item-active");
        item.removeAttribute("href");
    }
    return item;
}

export function createSidebarSubheading(
    text: string,
    button?: HTMLButtonElement,
) {
    const item = document.createElement("p");
    const textEl = document.createElement("span");
    textEl.innerText = text;
    item.appendChild(textEl);
    item.classList.add("sidebar-headline");
    if (button) {
        item.appendChild(button);
    }
    return item;
}
