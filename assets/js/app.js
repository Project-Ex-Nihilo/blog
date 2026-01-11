export const BASE_PATH = "";

export async function loadMetaData() {
    const meta_data = await fetch(`${BASE_PATH}/assets/meta_data.json`);
    if (!meta_data.ok) {
        console.error("Could not load meta_data data.");
        return;
    }
    return meta_data.json();
}

export async function loadFragmentInto(selector, fragmentPath) {
    const container = document.querySelector(selector);
    if (!container) return;
    try {
        const response = await fetch(`${BASE_PATH}${fragmentPath}`);
        if (!response.ok) {
            container.innerHTML = `<p>Failed to load fragment: ${fragmentPath}</p>`;
            return;
        }
        const html = await response.text();
        container.innerHTML = html;
    } catch (err) {
        console.error("Error loading fragment", fragmentPath, err);
        container.innerHTML = "<p>Error loading fragment.</p>";
    }
}

export async function initLayout() {
    await loadFragmentInto("#top-nav", "/src/partials/top-nav.html");
    await loadFragmentInto("#main-footer", "/src/partials/footer.html")
}

export function setupLinkInterception(navigateTo) {
    document.body.addEventListener("click", (event) => {
        const link = event.target.closest("a[data-link]");
        if (!link) return;

        const href = link.getAttribute("href");
        if (!href.startsWith("/")) return;

        event.preventDefault();
        navigateTo(href);
    });
}

export async function init() {
    const metadata = await loadMetaData();
    await initLayout();
    return metadata;
}
