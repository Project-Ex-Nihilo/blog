import {
    loadFragmentInto,
    init,
    getUserLanguage,
    setHistory,
    getUrl,
    formatDate,
    setPageMetadata,
} from "./app.js";

/**
 * @param {string} language
 * @returns {string}
 */
function extractLanguage(language) {
    if (language === "en-US" || language === "pt-BR") {
        return language.split("-")[0];
    }
    return "pt";
}

/**
 * Renders a title while keeping a short trailing parenthetical together.
 * @param {HTMLElement} element
 * @param {string} title
 * @returns {void}
 */
function renderPostTitle(element, title) {
    const title_parts = title.match(/^(.*)\s+(\([^()]{1,30}\))$/);
    if (!title_parts) {
        element.textContent = title;
        return;
    }

    const suffix = document.createElement("span");
    suffix.classList.add("post-title-suffix");
    suffix.textContent = title_parts[2];
    element.replaceChildren(`${title_parts[1]} `, suffix);
}

const page_metadata = {
    en: {
        "/": ["Home", "A workshop log about backend engineering, RISC-V, emulation, and Linux."],
        "/posts": ["Posts", "Technical articles from Project Ex-Nihilo."],
        "/about": ["About", "About Hamon-Rá and Project Ex-Nihilo."],
        "/contact": ["Contact", "Contact Hamon-Rá through LinkedIn or GitHub."],
    },
    pt: {
        "/": ["Início", "Um diário sobre backend, RISC-V, emulação e Linux."],
        "/posts": ["Posts", "Artigos técnicos do Project Ex-Nihilo."],
        "/about": ["Sobre", "Sobre Hamon-Rá e o Project Ex-Nihilo."],
        "/contact": ["Contato", "Entre em contato com Hamon-Rá pelo LinkedIn ou GitHub."],
    },
};

const static_routes = {
    "/": async (language, signal) =>
        loadFragmentInto(
            "#content-container",
            `/src/pages/home_${extractLanguage(language)}.html`,
            "/",
            signal
        ),
    "/posts": async (language, signal) => {
        const loaded = await loadFragmentInto(
            "#content-container",
            "/src/pages/posts.html",
            "/posts",
            signal
        );
        if (!loaded) return false;

        const posts_list = document.getElementById("posts-list");
        if (!posts_list || !Array.isArray(window.metadata?.posts)) return false;

        /** @type {Post[]} */
        const posts = window.metadata.posts
            .filter((post) => !post.draft)
            .slice()
            .sort((first, second) => second.date.localeCompare(first.date));

        for (const post of posts) {
            const new_post_element = document.createElement("li");
            const post_date_element = document.createElement("span");
            const post_link_container_element = document.createElement("span");
            const post_link_element = document.createElement("a");

            post_date_element.classList.add("post-date");
            post_date_element.textContent = formatDate(post.date, language);

            post_link_element.setAttribute(
                "href",
                `/${language}/post/${post.route}`
            );
            post_link_element.dataset.link = "";
            post_link_element.classList.add("blog-link");
            post_link_element.textContent = post.title[extractLanguage(language)];

            post_link_container_element.classList.add("post-list-title");
            post_link_container_element.appendChild(post_link_element);

            new_post_element.appendChild(post_date_element);
            new_post_element.appendChild(post_link_container_element);

            posts_list.appendChild(new_post_element);
        }
        return true;
    },
    "/about": async (language, signal) =>
        loadFragmentInto(
            "#content-container",
            `/src/pages/about_${extractLanguage(language)}.html`,
            "/about",
            signal
        ),
    "/contact": async (language, signal) =>
        loadFragmentInto(
            "#content-container",
            `/src/pages/contact_${extractLanguage(language)}.html`,
            "/contact",
            signal
        ),
};

let active_route_controller;

/**
 * @returns {void}
 */
async function router() {
    active_route_controller?.abort();
    active_route_controller = new AbortController();
    const { signal } = active_route_controller;

    /** @type {MetaData} */
    const metadata = window.metadata;

    const path = getUrl();
    const raw_language = getUserLanguage();
    const language = extractLanguage(raw_language);
    if (static_routes[path]) {
        const loaded = await static_routes[path](raw_language, signal);
        if (loaded && !signal.aborted) {
            setPageMetadata(...page_metadata[language][path]);
            window.scrollTo(0, 0);
        }
        return;
    }

    const postRegex = /^\/post\/([a-zA-Z0-9-]+)$/;
    const slug = path.match(postRegex);
    if (slug && Array.isArray(metadata?.posts)) {
        const post = metadata.posts.find((candidate) => candidate.route === slug[1]);
        if (post && !post.draft) {
            const post_path = `${post.path}/${post.route}_${language}.html`;
            const loaded = await loadFragmentInto(
                "#content-container",
                post_path,
                post.route,
                signal
            );
            if (!loaded || signal.aborted) return;

            const post_title = document.getElementById("post-title");
            if (post_title) renderPostTitle(post_title, post.title[language]);

            const post_published_date = document.getElementById("post-published-date");
            if (post_published_date) {
                post_published_date.textContent = formatDate(post.date, raw_language);
                post_published_date.setAttribute("datetime", post.date);
            }

            const post_author_name = document.getElementById("post-author-name");
            if (post_author_name) post_author_name.textContent = post.author;

            const post_read_time = document.getElementById("post-read-time");
            if (post_read_time) post_read_time.textContent = post.reading_time;

            setPageMetadata(post.title[language], post.description[language]);
            window.scrollTo(0, 0);
            return;
        }
    }

    const loaded = await loadFragmentInto(
        "#content-container",
        `/src/pages/not-found_${language}.html`,
        path,
        signal
    );
    if (loaded && !signal.aborted) {
        setPageMetadata(language === "pt" ? "Página não encontrada" : "Page not found");
        window.scrollTo(0, 0);
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    try {
        await init();
        await router();
    } catch (error) {
        console.error("Could not initialize the application.", error);
        const container = document.getElementById("content-container");
        if (container) container.textContent = "Could not load the site. Please try again.";
    }
});

document.body.addEventListener("click", async (event) => {

    const link = event.target.closest("a[data-link]");
    if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
        const href = link.getAttribute("href");
        if (!href?.startsWith("/")) return;
        event.preventDefault();
        setHistory(href);

        const nav_menu_hamburger = document.getElementById("nav-menu-hamburger");
        if (nav_menu_hamburger) {
            nav_menu_hamburger.classList.remove("active");
            document
                .getElementById("hamburger")
                ?.setAttribute("aria-expanded", "false");
        }

        await router();
        return;
    }

    const toggle_hamburger = event.target.closest("[data-toggle='hamburger']");
    if (toggle_hamburger) {
        const nav_menu_hamburger = document.getElementById("nav-menu-hamburger");
        const is_active = nav_menu_hamburger?.classList.toggle("active") || false;
        toggle_hamburger.setAttribute("aria-expanded", String(is_active));
        return;
    }
});

window.addEventListener("popstate", router);
