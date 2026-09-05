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

`src/data/states.ts` lists all 16 states with their latest completed election date
and official result link, verified against the Bundeswahlleiterin on 5 September
2026. Upcoming elections are excluded. Update this catalog after an election;
`years` lists only elections with local diagram datasets.

Every state has a diagram for its latest election: population → voting age →
eligibility → turnout → party results. Berlin, Hamburg, Bremen, Bayern, Hessen,
Sachsen and Thüringen additionally split the non-voters into "Unter <Wahlalter>",
"Nichtdeutsche" and a small "Sonstige Differenzen" remainder, estimated from
Destatis table 12411-0014 (Bevölkerung nach Altersjahren und Nationalität,
Stichtag 31.12.). Where the age-and-nationality arithmetic cannot stay
nonnegative (the birthday cohort between reference date and election day
outgrows the not-eligible group, e.g. NRW), the split is omitted and replaced
with a note. See `NONVOTER_BREAKDOWN.md` for the method and the per-state
status. Store processed data at `public/data/<state>/<year>.json` and
source files at `data/raw/<state>/<year>/`; `pnpm data:download <state>/<year>`
fetches new sources and `pnpm data:build` validates and converts them.
Add verified sources and a parser before enabling another diagram year.
