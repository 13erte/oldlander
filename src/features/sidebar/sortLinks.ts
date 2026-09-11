import { createSidebarItem, createSidebarSubheading } from "./sidebarItem";
import { getCurrentSort, getSortableFeedBase } from "./sortPaths";

/**
 * Sort shortcuts for the feed currently being viewed.
 * https://github.com/OctoNezd/oldlander/issues/35
 */
const SORT_OPTIONS = [
    { text: "Hot", sort: "hot", icon: "local_fire_department" },
    { text: "New", sort: "new", icon: "schedule" },
    { text: "Top", sort: "top", icon: "leaderboard" },
    { text: "Rising", sort: "rising", icon: "moving" },
    { text: "Controversial", sort: "controversial", icon: "bolt" },
] as const;

/**
 * Appends a "Sort" section for the current feed. Does nothing when the current
 * page is not a sortable listing.
 */
export default function buildSortLinks(parentContainer: HTMLDivElement) {
    const base = getSortableFeedBase(location.pathname);
    if (base === undefined) {
        return;
    }
    const currentSort = getCurrentSort(location.pathname);

    parentContainer.appendChild(document.createElement("hr"));
    parentContainer.appendChild(createSidebarSubheading("Sort"));
    for (const option of SORT_OPTIONS) {
        parentContainer.appendChild(
            createSidebarItem(
                option.text,
                `${base}/${option.sort}/`,
                option.icon,
                option.sort === currentSort,
            ),
        );
    }
}
