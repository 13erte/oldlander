import ExpandoProvider from "./expandoProvider";
import { getSelftextText } from "./selftext";

export default class iReddIt implements ExpandoProvider {
    sitename = "i.redd.it";
    urlregex = new RegExp(/https:\/\/i\.redd\.it\/.{13}.{3,}/);
    canHandlePost(post: HTMLDivElement) {
        const url = post.dataset.url;
        return !!(url && this.urlregex.test(url));
    }
    async createGalleryData(post: HTMLDivElement) {
        const url = post.dataset.url;
        if (!url) {
            return [];
        }
        // Listing pages never populate `dataset.selftext`, so reading it here
        // left image posts with text showing no text at all when opened from a
        // listing. The caption is rendered as text, so it must not be HTML.
        // https://github.com/OctoNezd/oldlander/issues/171
        const selftext = await getSelftextText(post);
        return [
            {
                imageSrc: url,
                caption: selftext === "" ? undefined : selftext,
            },
        ];
    }
}
