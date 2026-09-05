# Who voted?

Static Astro proof of concept for Berlin's 2023 Abgeordnetenhaus second-vote flow.

```sh
pnpm install
pnpm data:download # only when refreshing the official PDFs
pnpm dev
```

`pnpm data:build` regenerates and validates the committed JSON datasets under
`public/data/`. `pnpm data:download <state>/<year> …` refreshes official source
files; without arguments it downloads every state. The data step requires Node.js
24+, Poppler's `pdftotext`, and `unzip`; the Netlify build only runs `pnpm build`.

Berlin uses single Zweitstimmen; Hamburg and Bremen use five votes per voter
(Landesstimmen/Stimmen). Their party bands count votes, not people, and the
pages annotate this — see each dataset's `unitNote`.

Election URLs use `/:state/:year/`, with lowercase state slugs. Berlin is available
at `/berlin/2023/`. `/` lists the states, and `/:state/` lists available election
years. States without datasets show a preparation message. The old `/2023/`
route is removed.

`src/data/states.ts` registers Berlin, Hamburg, and Bremen. Available pages:
`/berlin/2023/`, `/hamburg/2025/`, and `/bremen/2023/`. `/` lists the states, and
`/:state/` lists available election years.
Store processed data at `public/data/<state>/<year>.json` and source files at
`data/raw/<state>/<year>/`. The current download/build scripts and visualization
are Berlin-specific. Before enabling Hamburg or Bremen, add their data parser
and adapt the visualization to their voting system, labels, and sources.
