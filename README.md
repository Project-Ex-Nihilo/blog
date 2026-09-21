# Project Ex-Nihilo Blog

The source for [projectexnihilo.com](https://www.projectexnihilo.com), a bilingual static blog about backend engineering, RISC-V, emulation, and Linux.

## Local development

Install the development tools and start the local server:

```sh
npm install
npm run serve
```

Open <http://localhost:8000>. The custom Python server serves `404.html` for client-side routes so that direct links behave like the deployed site.

Run the JavaScript checks with:

```sh
npm run check
```

## Content structure

- `assets/meta_data.json` contains post metadata. Set `"draft": true` to hide a post from the list and prevent it from being routed.
- `src/posts/<number>-<slug>/` contains the English and Portuguese post fragments.
- Public URLs use `/en-US/` or `/pt-BR/` followed by the client-side route.
