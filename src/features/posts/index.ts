import "./css/postIcons.css";

import setupPostContainer from "./postContainer";
import setupExpando from "./expando";
import setupExpandoButton from "./expandoButton";
import setupToggles from "./postToggles";
import { OLFeature } from "../base";
import NativeShare from "./nativeSharing";
import IndentCommentHide from "./indentCommentHide";
import ReimplementVotes from "./reimplementVotes";
import ButtonHide from "./buttonHide";

/**
 * OldLander hides Reddit's native expando button and expects the thumbnail to be
 * the tap target instead. Subreddits configured without thumbnails therefore
 * leave text posts with no way to expand at all, so give those posts the native
 * button back. https://github.com/OctoNezd/oldlander/issues/135
 */
function revealExpandoWithoutThumbnail(postContainer: HTMLDivElement) {
    const hasThumbnail = postContainer.querySelector(".thumbnail") !== null;
    const hasExpandoButton =
        postContainer.querySelector(".expando-button") !== null;
    if (!hasThumbnail && hasExpandoButton) {
        postContainer.classList.add("ol-no-thumbnail");
    }
}

function setupLinkPost(post: HTMLDivElement) {
    const comments = post.querySelector<HTMLAnchorElement>(".comments");
    if (comments !== null) {
        comments.innerText = comments.innerText.split(" ")[0];
        if (comments.innerText.includes("comment")) {
            comments.innerText = "0";
        }
    }

    // remove thumbnail no-image indicator. Could be done with CSS, but FF doesn't support :has.
    const thumbnail = post.querySelector(".thumbnail");
    if (thumbnail !== null && thumbnail.children.length === 0) {
        thumbnail.remove();
    }

    const postContainer = setupPostContainer(post);
    setupExpando(post);
    setupExpandoButton(postContainer);
    revealExpandoWithoutThumbnail(postContainer);
}

// export default function setupPosts() {
//     waitForAllElements(".link:not(.ol-post-container .link)", setupPost);
// }

// setupPosts();
class PostsEnhance extends OLFeature {
    moduleId = "postsEnhance";
    moduleName = "Make posts more mobile-friendly";
    async init(): Promise<void> {
        setupToggles();
    }
    async onPost(post: HTMLDivElement) {
        if (post.classList.contains("link")) {
            setupLinkPost(post);
        }
    }
}
export default [
    PostsEnhance,
    NativeShare,
    IndentCommentHide,
    ReimplementVotes,
    ButtonHide,
];
