export const BASE_PATH = "";

export async function loadMetaData() {
    const meta_data = await fetch(`${BASE_PATH}/assets/meta_data.json`);
    if (!meta_data.ok) {
        console.error("Could not load meta_data data.");
        return;
    }
    return meta_data.json();
}

/**
 * Loads an HTML fragment into a container element.
 * @param {string} selector - The CSS selector of the container.
 * @param {string} fragmentPath - Path to the HTML fragment.
 * @param {string} [route] - Optional route name used for error messages.
 * @returns {Promise<void>}
 */
export async function loadFragmentInto(selector, fragmentPath, route) {
    const container = document.querySelector(selector);
    if (!container) return;
    try {
        const response = await fetch(`${BASE_PATH}${fragmentPath}`);
        if (!response.ok) {
            container.innerHTML = `<p>Failed to load fragment: ${fragmentPath}</p>`;
            return;
        }
        const html = await response.text();
        if (html.match(/<html|<!DOCTYPE/i)) {
            container.innerHTML = `<p>Post ${route} not found.</p>`;
            return;
        }
        container.innerHTML = html;
        container.querySelectorAll("pre code").forEach((block) => {
            hljs.highlightElement(block);
        });
    } catch (err) {
        console.error("Error loading fragment", fragmentPath, err);
        container.innerHTML = "<p>Error loading fragment.</p>";
    }
}

/**
 * Initialize the main layout.
 * @returns {Promise}
 */
export async function initLayout() {
    await loadFragmentInto("#top-nav", "/src/partials/top-nav.html");
    await loadFragmentInto("#main-footer", "/src/partials/footer.html");

    const footer_year = document.getElementsByClassName("page-year");
    const now = new Date()
    footer_year[0].innerHTML = now.getFullYear()
}

/**
 * Sets the user language in localStorage.
 * @param {string} language
 * @returns {void}
 */
export function setUserLanguage(langauge) {
    localStorage.setItem("lang", langauge);
}

/**
 * Gets the user language from localStorage.
 * @returns {string | null}
 */
export function getUserLanguage() {
    return localStorage.getItem("lang");
}

/**
 * @param {string} path
 * @returns {void}
 */
export function setHistory(path) {
    const full_url = BASE_PATH + path;
    const user_language = getUserLanguage();
    window.history.pushState(null, null, `/${user_language}${full_url}`);
}

/**
 * @returns {void}
 */
export function getUrl() {
    return location.pathname.replace(/^\/[a-z]{2}-[A-Z]{2}/, "") || "/"
}

/**
 * @returns {Promise}
 */
export async function init() {
    /** @type {MetaData} */
    const metadata = await loadMetaData();
    await initLayout();
    

    const user_language = location.pathname.match("^\/([a-z]{2}-[A-Z]{2})") || ["", "pt-BR"];
    setUserLanguage(user_language[1]);

    const path = getUrl();
    setHistory(path);

    window.metadata = metadata;
    return;
}

/**
 * @param {string} date
 * @param {string} locale
 * @returns {string}
 */
export function formatDate(date, locale) {
    const new_date = new Date(date);
    return new_date.toLocaleDateString(locale, {
        month: "long",
        day: "numeric",
        year: "numeric"
    })
}