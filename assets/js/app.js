export const BASE_PATH = "";
export const DEFAULT_LOCALE = "pt-BR";
export const SUPPORTED_LOCALES = ["pt-BR", "en-US"];

export async function loadMetaData() {
    const meta_data = await fetch(`${BASE_PATH}/assets/meta_data.json`);
    if (!meta_data.ok) {
        throw new Error(`Could not load metadata (${meta_data.status}).`);
    }
    return meta_data.json();
}

/**
 * Loads an HTML fragment into a container element.
 * @param {string} selector - The CSS selector of the container.
 * @param {string} fragmentPath - Path to the HTML fragment.
 * @param {string} [route] - Optional route name used for error messages.
 * @param {AbortSignal} [signal] - Optional signal used to cancel stale routes.
 * @returns {Promise<boolean>}
 */
export async function loadFragmentInto(selector, fragmentPath, route, signal) {
    const container = document.querySelector(selector);
    if (!container) return false;
    try {
        const response = await fetch(`${BASE_PATH}${fragmentPath}`, { signal });
        if (!response.ok) {
            container.innerHTML = `<p>Failed to load fragment: ${fragmentPath}</p>`;
            return false;
        }
        const html = await response.text();
        if (html.match(/<html|<!DOCTYPE/i)) {
            container.innerHTML = `<p>Post ${route} not found.</p>`;
            return false;
        }
        container.innerHTML = html;
        const locale = getUserLanguage() || DEFAULT_LOCALE;
        container.querySelectorAll("a[data-link]").forEach((link) => {
            const href = link.getAttribute("href");
            if (href?.startsWith("/") && !/^\/(?:en-US|pt-BR)(?=\/|$)/.test(href)) {
                link.setAttribute("href", `/${locale}${href}`);
            }
        });
        if (window.hljs) {
            try {
                container.querySelectorAll("pre code").forEach((block) => {
                    window.hljs.highlightElement(block);
                });
            } catch (highlight_error) {
                console.warn("Syntax highlighting is unavailable.", highlight_error);
            }
        }
        return true;
    } catch (err) {
        if (err.name === "AbortError") return false;
        console.error("Error loading fragment", fragmentPath, err);
        container.innerHTML = "<p>Error loading fragment.</p>";
        return false;
    }
}

/**
 * Initialize the main layout.
 * @returns {Promise}
 */
export async function initLayout() {
    await Promise.all([
        loadFragmentInto("#top-nav", "/src/partials/top-nav.html"),
        loadFragmentInto("#main-footer", "/src/partials/footer.html"),
    ]);

    const footer_year = document.querySelector(".page-year");
    if (footer_year) footer_year.textContent = new Date().getFullYear();

    const language = getUserLanguage()?.startsWith("en") ? "en" : "pt";
    document.querySelectorAll("[data-label-en][data-label-pt]").forEach((item) => {
        item.textContent =
            language === "en" ? item.dataset.labelEn : item.dataset.labelPt;
    });
}

/**
 * Sets the user language in localStorage.
 * @param {string} language
 * @returns {void}
 */
export function setUserLanguage(language) {
    localStorage.setItem("lang", language);
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
 * @param {boolean} [replace]
 * @returns {void}
 */
export function setHistory(path, replace = false) {
    const user_language = getUserLanguage() || DEFAULT_LOCALE;
    const path_without_locale = path.replace(
        /^\/(?:en-US|pt-BR)(?=\/|$)/,
        ""
    );
    const normalized_path = path_without_locale.startsWith("/")
        ? path_without_locale
        : `/${path_without_locale}`;
    const url = `/${user_language}${BASE_PATH}${normalized_path}`;
    const method = replace ? "replaceState" : "pushState";
    window.history[method](null, "", url);
}

/**
 * @returns {void}
 */
export function getUrl() {
    return (
        location.pathname.replace(/^\/(?:en-US|pt-BR)(?=\/|$)/, "") || "/"
    );
}

/**
 * Updates document metadata after client-side navigation.
 * @param {string} title
 * @param {string} [description]
 * @returns {void}
 */
export function setPageMetadata(title, description = "") {
    document.title = title ? `${title} | Project Ex-Nihilo` : "Project Ex-Nihilo";
    const description_element = document.querySelector("meta[name=\"description\"]");
    if (description_element) description_element.setAttribute("content", description);
}

/**
 * @returns {Promise}
 */
export async function init() {
    /** @type {MetaData} */
    const metadata = await loadMetaData();
    const locale_match = location.pathname.match(/^\/(en-US|pt-BR)(?=\/|$)/);
    const user_language = locale_match?.[1] || DEFAULT_LOCALE;
    setUserLanguage(user_language);
    document.documentElement.lang = user_language;
    await initLayout();

    const path = getUrl();
    setHistory(path, true);

    window.metadata = metadata;
    return;
}

/**
 * @param {string} date
 * @param {string} locale
 * @returns {string}
 */
export function formatDate(date, locale) {
    const date_parts = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const new_date = date_parts
        ? new Date(
            Number(date_parts[1]),
            Number(date_parts[2]) - 1,
            Number(date_parts[3])
        )
        : new Date(date);
    return new_date.toLocaleDateString(locale, {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}
