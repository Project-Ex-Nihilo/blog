import {
    BASE_PATH,
    loadFragmentInto,
    setupLinkInterception,
    init,
} from "./app.js";

const routes = [
    {
        match: (path) => path === "/",
        render: () => loadFragmentInto("#content-container", "/src/pages/home.html"),
    },
    {
        match: (path) => path === "/about",
        render: () => loadFragmentInto("#content-container", "/src/pages/about.html"),
    },
    {
        match: (path) => {
            const postRegex = /^\/post\/([a-zA-Z0-9\-]+)$/;
            const match = path.match(postRegex);
            if (match) return { slug: match[1] };
            return null;
        },
        render: (params) => 
            loadFragmentInto("#content-container", params)
    },
];

let metadata = null;

async function router() {
    if (!metadata) {
        metadata = await init();
    }

    let path = window.location.pathname;
    if (BASE_PATH && path.startsWith(BASE_PATH)) {
        path = path.slice(BASE_PATH.length) || "/";
    }
    if (path === "") path = "/";

    for (const route of routes) {
        const result = route.match(path);
        if (result === true) {
            await route.render({});
            window.scrollTo(0, 0);
            return;
        } else if (result?.slug) {
            const post = metadata.posts.find(p => p.route === result.slug);
            if (post) {
                let user_language = navigator.language || "pt-BR";
                user_language = user_language.split("-")[0];
                const path = `${post.path}/${post.route}_${user_language}.html`;
                await route.render(path);
                window.scrollTo(0, 0);
                return;
            }

            await loadFragmentInto("#content-container", "/src/pages/post-not-found.html");
            window.scrollTo(0, 0);
        }
    }

    await loadFragmentInto("#content-container", "/src/pages/not-found.html");
    window.scrollTo(0, 0);
}

function navigateTo(url) {
    const fullUrl = BASE_PATH + url;
    window.history.pushState(null, null, fullUrl);
    router();
}

window.addEventListener("DOMContentLoaded", async () => {
    metadata = await init();
    setupLinkInterception(navigateTo);
    router();
});

window.addEventListener("popstate", router);
