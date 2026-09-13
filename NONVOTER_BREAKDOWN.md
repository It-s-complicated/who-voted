# Non-eligible population breakdown

Berlin 2023 is the completeness and presentation benchmark. All 17 election
datasets show demographic Sankey sub-bands. Every dataset carries age and citizenship counts,
reference dates, population basis, method and source links.

## Method

- `underVotingAge`: residents below the election's minimum voting age.
- `nonGermanVotingAgeOrOlder`: foreign residents minus foreign residents below
  that age, avoiding overlap.
- `otherOrTimingDifference`: the remainder after subtracting those groups from
  residents minus eligible voters.

The generic importer reads totals and demographic cells from one coherent
official export. NRW, Schleswig-Holstein and Saarland use [Zensus 2022 table
1000A-2012](https://ergebnisse.zensus2022.de/datenbank/online/statistic/1000A/table/1000A-2012),
whose reference date is 15 May 2022. The census date is election day in NRW,
seven days after in Schleswig-Holstein and 49 days after in Saarland. Census
cell perturbation can cause small differences between detailed sums and the
published total.

Other area states use [Destatis table
12411-0014](https://www-genesis.destatis.de/datenbank/online/statistic/12411/table/12411-0014),
using the nearest available year-end in the stored 2000–2025 export. A date
after a historical election is allowed and disclosed. Gaps over 90 days receive
an additional visible caveat; this is a presentation heuristic, not a quality
certification. Sachsen-Anhalt 2026 has a 249-day gap and preliminary results.

Berlin keeps its register-based counts. Bremen keeps its census-2022-based
annual counts. Hamburg uses register totals with an under-16/under-18 ratio from
population statistics, including an estimate for foreign minors; this is shown
on the page.

## Reconciling statistical differences

The chart uses the ratio of under-age to non-German voting-age residents to
estimate a two-group split of `residents − eligible voters`. Both positive and
negative source differences are handled by proportional allocation. This assumes
the source ratio is transferable and the two groups exhaust the modeled total;
it is an illustrative estimate, not a correction to official statistics.

Ribbons use unrounded estimated counts and conserve the non-eligible total.
Demographic labels show estimated counts rounded to thousands prefixed by `ca.`
and rounded whole percentages of all residents prefixed by `~`. No statistical-difference node or residual ribbon is drawn. The population
is the sole starting node. Asterisks on both demographic labels refer to a caption explaining the
method, assumptions and rounding. Original demographic counts remain unchanged
in the data and are labeled as population-statistics figures in the table.
The signed difference (non-eligible total minus the two source groups) remains
in the caption alongside provenance and source-date caveats.

Earlier Bayern, Hessen, Sachsen and Thüringen splits mixed older population
totals with revised demographic counts. Coherent snapshots remove those
misleading positive remainders.

## Reproduction and validation

`state-sources.mjs` selects official exports and dates; `population.mjs` rejects
missing, malformed or duplicate age/citizenship cells. `process-data.mjs` joins
results and demographics. `validate-election.mjs` requires demographic
provenance, real calendar dates, explanations for estimates or mixed dates, and
agreement between demographic counts and displayed sub-bands. `pnpm test`
exercises both export formats and corrupted datasets, then checks generated
pages and Sankey geometry.
