import {
    loadFragmentInto,
    init,
    getUserLanguage,
    setHistory,
    getUrl,
    formatDate
} from "./app.js";

/**
 * @param {string} language
 * @returns {string}
 */
function extractLanguage(language) {
    if(language == "en-US" || language == "pt-BR") return language.split("-")[0];
    return "pt";
}

const static_routes = {
    "/": async (language) => { await loadFragmentInto("#content-container", `/src/pages/home_${extractLanguage(language)}.html`, "/"); },
    "/posts": async (language) => { 
        await loadFragmentInto("#content-container", `/src/pages/posts.html`, "/posts");
        const posts_list = document.getElementById("posts-list");
        
        /** @type {Post[]} */
        const posts = window.metadata.posts
        for(let i = 1; i < posts.length; i++) {
            const post = posts[i];
            const new_post_element = document.createElement("li");
            const post_date_element = document.createElement("span");
            const post_link_container_element = document.createElement("span");
            const post_link_element = document.createElement("a");

            post_date_element.classList.add("post-date");
            post_date_element.textContent = new Date(post.date).toLocaleDateString(language);

            post_link_element.setAttribute("href", `/post/${post.route}`);
            post_link_element.dataset.link = "";
            post_link_element.classList.add("blog-link");
            post_link_element.textContent = post.title[extractLanguage(language)];

            post_link_container_element.classList.add("post-list-title");
            post_link_container_element.appendChild(post_link_element);

            new_post_element.appendChild(post_date_element);
            new_post_element.appendChild(post_link_container_element);

            posts_list.appendChild(new_post_element);
        }
    },
    "/about": async (language) => { await loadFragmentInto("#content-container", `/src/pages/about_${extractLanguage(language)}.html`, "/about"); },
    "/contact": async (language) => { await loadFragmentInto("#content-container", `/src/pages/contact_${extractLanguage(language)}.html`, "/contact"); }
}

/**
 * @returns {void}
 */
async function router() {

    /** @type {MetaData} */
    const metadata = window.metadata;

    const path = getUrl();
    const raw_language = getUserLanguage();
    const language = extractLanguage(raw_language);
    if(static_routes[path]) {
        static_routes[path](raw_language);
        return;
    }

    const postRegex = new RegExp("^\/post\/([a-zA-Z0-9\-]+)$");
    const slug = path.match(postRegex);
    if(slug) {
        const post = metadata.posts.find(p => p.route === slug[1]);
        if(post) {
            const post_path = `${post.path}/${post.route}_${language}.html`;
            await loadFragmentInto("#content-container", post_path, language);

            const post_title = document.getElementById("post-title");
            post_title.textContent = post.title[language];

            const post_published_date = document.getElementById("post-published-date");
            post_published_date.textContent = formatDate(post.date, raw_language);

            const post_author_name = document.getElementById("post-author-name");
            post_author_name.textContent = post.author;

            const post_read_time = document.getElementById("post-read-time");
            post_read_time.textContent = post.reading_time;

            window.scrollTo(0, 0);
            return;
        }
    }

    await loadFragmentInto("#content-container", `/src/pages/not-found_${language}.html`, "/");
    window.scrollTo(0, 0);
}

window.addEventListener("DOMContentLoaded", async () => {
    await init();
    router();
});

document.body.addEventListener("click", (event) => {

    const link = event.target.closest("a[data-link]");
    if(link) {
        const href = link.getAttribute("href");
        if (!href.startsWith("/")) return;
        setHistory(href);

        const nav_menu_hamburger = document.getElementById("nav-menu-hamburger");
        if(nav_menu_hamburger) {
            nav_menu_hamburger.classList.remove("active");
        }

        router();
        event.preventDefault();
        return;
    }

    const toggle_hamburger = event.target.closest("[data-toggle='hamburger']");
    if(toggle_hamburger) {
        const nav_menu_hamburger = document.getElementById("nav-menu-hamburger");
        nav_menu_hamburger.classList.toggle("active");
        return;
    }
});

window.addEventListener("popstate", router);