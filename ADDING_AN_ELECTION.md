# Adding an election

An election is ready to add when its official results, population and demographic data, and election-specific rules can reproduce a complete diagram. Collect the evidence first, then register the election and implement its import. A catalog entry alone does not produce a working dataset.

This guide describes the current pipeline. Use [ElectionData](src/data/election.ts) for the output fields, [validateElection](scripts/validate-election.mjs) for data constraints, and [Berlin 2023](public/data/berlin/2023.json) as a complete example. For source discovery, see [the availability review](DATA_AVAILABILITY_REVIEW.md) and [official rule references](ELECTION_RULES.md).

## 1. Collect the required data

Use statewide figures for the same election and territory. Keep absolute counts; rounded percentages cannot reconstruct the flows reliably.

| Input | Required information | Where it is used |
| --- | --- | --- |
| Election identity | State, year, exact election date, official result URL, and final or preliminary status | Catalog, page heading, source labels |
| Electoral roll | Number of eligible voters | `eligibility.eligible` |
| Participation | Number of people who voted, including people with invalid ballots | `turnout.voters` |
| Displayed vote category | Valid votes, invalid votes, and any uncast votes in that category | `secondVotes` |
| Party results | Absolute votes for every party/list and relevant independent candidate in the displayed category | `secondVotes.parties`; the full sum must equal valid votes |
| Previous parliament | Parties that won seats at the preceding election, checked against its official seat distribution | `previousParliament` in `src/data/states.ts`; keeps those parties visible even below 5% |
| Residents | Total population, reference date, and statistical basis, such as a census, population estimate, or population register | `population` |
| Age and citizenship | Residents below voting age, and non-German residents at or above voting age; reference date and method | `population.demographics` |
| Election rules | Official evidence for minimum voting age, vote category and label, and votes per voter in that category | `scripts/election-rules.mjs` |
| Source provenance | Publisher, URL, local file, retrieval time, checksum, and exact table/page/sheet/column location | Raw source manifest and output sources |

Prefer the election authority's results and statistical office's population data. A preliminary result is usable when counting is complete for the whole territory and its status is explicit. Do not substitute a partial count, forecast, or projection for a statewide result. Include small parties in the input; the page groups them for display.

The chart shows parties from the preceding parliament plus parties with at least 5% of current votes. Before adding an election, check whether a new party won seats below 5%; that case needs an explicit seat-based selection rule.

Prefer official CSV or structured API exports, then Excel, then HTML tables; use PDF as a fallback. Choose by completeness and meaning first: the source must cover the required figures, election year, territory, vote category, and result status (or population reference date and basis). A complete final Excel result is preferable to a partial or preliminary CSV. Check column definitions, encoding, delimiters, number formats, and totals even for structured exports.

Existing sources can be replaced after verifying equivalent coverage. Update the downloader configuration, parser, retained file, and manifest together, regenerate the output, and compare every imported count against the previous dataset and official totals. Investigate differences and document any official correction; preserve shared population snapshots used by other elections.

### Vote categories and ballots

`secondVotes` is the existing field name for the displayed vote category, even when that category has another official name. `votesPerVoter` is the maximum number of votes **in that category**, not the number of choices across every ballot.

For examples already supported, consult [the election rule table](ELECTION_RULES.md): a second/list vote generally contributes one vote per person; Bavaria combines first and second votes; Hamburg uses its state-list ballot; Bremen uses its parliament ballot. Check the particular election's evidence rather than copying the latest rules for its state.

For a ballot-based import like Hamburg or Bremen, also collect returned, valid, and invalid ballots for the displayed category, plus voters who returned no such ballot. These populate `ballots.total`, `valid`, `invalid`, and `none`. Unused voting capacity on a valid ballot is different from an invalid ballot. A multi-vote dataset also needs an explanation of its units; see the existing `unitNote` values and parser examples.

### Demographic completeness

Use a coherent snapshot of residents, age, and citizenship close to the election date. The two demographic groups must not overlap: the under-age count includes all citizenships; the non-German count includes only people old enough to vote. All non-German residents or all minors alone are insufficient.

The shared [population parser](scripts/population.mjs) expects the total population, total non-German population, and single-year age counts below voting age for both groups. It derives non-German adults by subtracting non-German children. Its supported exports are GENESIS `12411-0014` and Zensus `1000A-2012`; other layouts need an explicitly checked parser. Grouped ages are usable only when they support the election's age threshold, or when a documented estimation method is implemented.

Record the population basis and dates. If demographic and total-population dates differ, explain the mismatch and include the demographic date in `demographics.note`. An estimated method requires a note describing its inputs and calculation. The build supplies the population-to-election timing note and flags demographic gaps over 90 days; that annotation does not establish that a chosen snapshot is suitable.

Preserve differences between population statistics and the electoral roll. Do not adjust official demographic counts to make them fit. The current diagram estimates its non-eligible split proportionally and retains the source counts and discrepancy in annotations; see [the demographic methodology](NONVOTER_BREAKDOWN.md). If the demographic sum exceeds `notEligible`, provide an `eligibility.note` explaining the discrepancy.

The schema permits a null estimated breakdown with an explanation, but the current diagram regression checks require a breakdown, and demographic counts remain required. Missing demographic evidence therefore needs an explicit product/parser change before the election can meet the current checks.

## 2. Retain the evidence

Keep election inputs and their manifest under:

```text
data/raw/<state>/<year>/results.<html|pdf|xlsx|csv>
data/raw/<state>/<year>/<additional-source-files>
data/raw/<state>/<year>/sources.json
public/data/<state>/<year>.json                  # generated output
```

The downloader records a manifest-level `retrievedAt` and each source's `id`, `url`, `file`, and `sha256`, plus configured metadata. Supply a publisher and a precise source location; record licence information when available. Keep the IDs consistent with the parser's `sourceFiles`, `population.sourceId`, and `demographics.sourceIds`. Output validation requires sources named `results` and `population`, as well as every referenced source ID. The build verifies the input bytes against manifest checksums.

Rule references live separately in `scripts/election-rules.mjs`, with URL, publisher, and relevant page or section. Update [ELECTION_RULES.md](ELECTION_RULES.md) with the election's evidence too. These references currently remain links; the downloader does not archive them automatically.

Before downloading, inspect the configured population file paths. Even a download limited to one election can overwrite `data/raw/population/` files used by older manifests. Preserve existing bytes and configure a new versioned file path when refreshing an export. Do not update old checksums merely to silence a mismatch. Versioning shared population snapshots is currently a manual configuration task.

## 3. Wire the election into the pipeline

| File | Change |
| --- | --- |
| [src/data/states.ts](src/data/states.ts) | Add `elections[year]` with `electionDate`, the official result `url`, and `previousParliament` from the preceding election's seat distribution. Years and latest-election links are derived automatically. |
| [scripts/election-rules.mjs](scripts/election-rules.mjs) | Add the exact `state/year` key, voting age, official vote label, votes per voter, references, and any unit note. For the shared HTML parser, supply a zero-based `resultColumn` checked against that retained table. Unknown routes have no rule fallback. |
| [scripts/state-sources.mjs](scripts/state-sources.mjs) | For states using the shared import, configure the result filename, publisher, location, and status. Verify the selected population source, reference date, and basis. Set `resultStatus: 'preliminary'` explicitly when applicable; the shared parser otherwise defaults to final. |
| [scripts/download-data.mjs](scripts/download-data.mjs) | Hamburg and Bremen currently have separate, exact-election source entries here. Add a new entry for their new election and any required additional sources. Other states, including both Berlin elections, inherit their source configuration from `stateSources`. |
| [scripts/process-data.mjs](scripts/process-data.mjs) | Reuse a parser only after verifying the actual document layout. Add and register an election-specific parser where needed. Hamburg and Bremen are explicitly registered in the assembly block; Berlin uses election-specific result parsers and the shared population import. |
| [scripts/check-data.mjs](scripts/check-data.mjs) | Add independently verified expected totals for the new state/year. Existing expected totals are mostly keyed by state; convert affected assertions to exact election keys so historical elections keep their own expectations. |

Check PDF pages, table headers, year headings, party lists, spreadsheet sheets/columns, and completeness indicators before reusing any parser. Matching filenames or states do not prove matching layouts. The existing Brandenburg and Rheinland-Pfalz branches still contain document-specific assumptions.

Review the shared population-date selection too: it currently chooses between census data and annual snapshots using hardcoded routes and a year-selection heuristic capped at 2025. Adding a newer election does not automatically select a newer export. The census parser also identifies its format through `1000A-2012` in the filename; preserve that marker when naming a versioned census file.

The catalog and URLs currently identify elections by state and year. Two elections in the same state and calendar year would need an identity/routing change before either could be represented separately.

## 4. Check the arithmetic

All counts must be finite, nonnegative safe integers. With `capacity = voters × votesPerVoter`, verify:

```text
eligible <= residents
voters <= eligible
notEligible = residents - eligible
nonVoters = eligible - voters
sum(party votes) = valid votes

# Imports without a separate ballots object:
noValidSecondVote = capacity - valid votes
noSecondVote = capacity - valid votes - invalid votes
noValidSecondVote = invalid votes + noSecondVote

# Imports with a ballots object:
ballots.total = ballots.valid + ballots.invalid
voters = ballots.total + ballots.none
valid votes <= ballots.valid × votesPerVoter
unused votes on valid ballots = ballots.valid × votesPerVoter - valid votes

# Demographic reconciliation:
otherOrTimingDifference = max(0, notEligible - underVotingAge - nonGermanVotingAgeOrOlder)
```

Use subtraction only when the source definitions support these identities. In particular, confirm whether invalid counts mean votes or ballots, and whether an omitted vote is already counted as invalid. Keep original source counts and explain differences instead of forcing a result to balance.

## 5. Build and review

The data tools require Node.js 24+, `pdftotext`, and `unzip`. After configuring the inputs and protecting shared snapshots, run from the repository root, replacing `<state>/<year>` with the new route:

```sh
pnpm data:download <state>/<year>
pnpm data:build
pnpm test
pnpm dev
```

`data:build` processes all configured elections. `pnpm test` repeats that build, checks data and metadata, runs Astro diagnostics and a static build, and verifies state pages and diagram geometry. Existing tests also contain a fixed completed-election cutoff in `scripts/check-states.mjs` and an election-count message in `scripts/check-data.mjs`; update those when appropriate without weakening the underlying checks.

Before considering the election complete:

- Compare eligible voters, voters, valid votes, and party totals against an official table independently of the parser.
- Open `/<state>/<year>/` and check the date, result status, voting age, vote labels, source links, population timing notes, demographic explanation, and data table.
- Check its state page lists the year correctly and retains older years.
- Review the raw files, manifests, configuration, tests, and generated JSON together. Unrelated historical datasets should change only for a documented reason.

Commit the complete input-to-output change together. Avoid hand-editing generated JSON: the next data build replaces it. Refresh the README's availability summary when the supported elections change.
