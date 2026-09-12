# Who voted?

Static Astro site for German state elections and population-based voting flows.

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
(Landesstimmen), Bayern two (Erst- und Zweitstimmen). Their party bands count
votes, not people, and the pages annotate this — see each dataset's `unitNote`.

Election URLs use `/:state/:year/`, with lowercase state slugs. Berlin is available
at `/berlin/2023/`. `/` lists the states, and `/:state/` lists available election
years. The old `/2023/` route is removed.

Berlin 2023 is the current gold standard for data completeness and presentation,
including the Sankey chart itself and its info annotations. Use the rendered
`/berlin/2023/` page as the reference; see [the benchmark in PRODUCT.md](PRODUCT.md#current-gold-standard-berlin-2023).
Completeness includes residents below voting age and residents excluded by
citizenship, usually requiring additional official demographic data beyond
election results. Population, age, and citizenship data must have reference dates
close to the election date; disclose any timing gaps or mismatches between sources.
See [the all-state data availability review](DATA_AVAILABILITY_REVIEW.md) for
official source alternatives, timing gaps, and remaining demographic data needs.

`src/data/states.ts` lists all 16 states with their latest completed election date
and official result link, reviewed on 12 September 2026. Sachsen-Anhalt includes
its preliminary 2026 result as well as 2021; there are 17 election datasets.
`years` lists only elections with local diagram datasets.

Every state has a diagram for its latest election. Berlin, Hamburg, Bremen and
Saarland split the non-eligible population into residents below voting age,
non-German residents of voting age, and a reconciliation remainder. All other
datasets preserve these demographic counts in annotations because they exceed
the non-eligible total derived from the electoral roll.

The import uses coherent population, age and citizenship snapshots: census-day
2022 data for NRW, Schleswig-Holstein and Saarland; the nearest available annual
snapshot for other area states; and dedicated sources for Berlin, Hamburg and
Bremen. Timing gaps and Hamburg's age-ratio estimate are visible on the pages.
See [NONVOTER_BREAKDOWN.md](NONVOTER_BREAKDOWN.md) for methods and current counts.
Processed datasets live at `public/data/<state>/<year>.json`, source manifests
at `data/raw/<state>/<year>/`, and shared exports at `data/raw/population/`.
`pnpm data:download <state>/<year>` refreshes sources; `pnpm data:build` validates
and converts them. `pnpm test` also checks demographic parser failures, invalid
metadata, vote conservation, generated pages and Sankey geometry.
Add verified sources and a parser before enabling another diagram year.
