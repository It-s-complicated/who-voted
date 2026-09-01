# Who voted?

Static Astro proof of concept for Berlin's 2023 Abgeordnetenhaus second-vote flow.

```sh
pnpm install
pnpm data:download # only when refreshing the official PDFs
pnpm dev
```

`pnpm data:build` regenerates and validates the committed `public/data/2023.json`.
The data step requires Node.js 24+ and Poppler's `pdftotext` command; the Netlify build only runs `pnpm build`.
