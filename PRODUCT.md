# Who voted?

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Voters and ordinary people seeking to understand participation in German state elections. No specialist knowledge of elections or statistics should be required.

## Product Purpose

An information piece that makes the proportions of voters and non-voters in German state elections understandable. It places election participation and party votes in the context of the whole resident population.

## Operating Context

The German-language page at `/berlin/2023/` visualizes Berlin's 2023 Abgeordnetenhaus second votes. `DATA_SOURCES.md` describes a possible 2026 data update, not a requirement to replace the 2023 edition.

## Current Gold Standard: Berlin 2023

As of 12 September 2026, [Berlin 2023](http://localhost:4321/berlin/2023/) is the project's gold standard for both data completeness and actual presentation. Use the rendered page as the reference when adding or improving other election pages, covering the Sankey chart itself and its info annotations.

- **Data completeness:** the full flow from residents through eligibility, participation, valid second votes, and party results; the estimated ineligibility breakdown into under-18 residents, non-German adults, and the remaining difference; invalid and uncast second votes; a supporting data table and official sources.
- **Residents not eligible to vote:** showing who is below the election's minimum voting age and who lacks German citizenship is a core part of completeness. This usually requires additional official population data by age and citizenship beyond election results. Source that demographic data when adding or improving an election dataset, using the applicable voting age and recording its reference date. Count non-German residents only at or above voting age in the citizenship group to avoid double-counting younger residents. Label estimates and explain any remaining difference; see `NONVOTER_BREAKDOWN.md` for the method and data availability.
- **Demographic reference dates:** good population, age, and citizenship data must describe residents close to the election date. Select suitable official data with reference dates as close as possible to that election, preferably aligned across these figures. Judge proximity by the date the data describes, not its publication or download date. Show the reference dates and explain gaps from election day or mismatches between sources; if only distant data is available, disclose that limitation rather than treating it as meeting the benchmark.
- **Sankey presentation:** the vertical flow, category colors, readable labels with counts and resident-based percentages, small-category leader lines, and party labels and grouping.
- **Info annotations:** final-result status and population reference date, the estimate and register-difference explanation, the party-grouping note, the invalid-versus-uncast vote explanation, and source links.

Match this level of completeness and clarity where the available data supports it. Keep election-specific rules and units accurate, and explain unavailable breakdowns rather than implying that every election has Berlin's data coverage. This is the current benchmark, not a freeze on future improvements.

## Capabilities and Constraints

- The existing Sankey follows residents through eligibility, participation, valid second votes, and party votes. A collapsible table provides the counts in another form.
- The current page calculates percentages against the same resident total. Keep the denominator explicit when presenting proportions.
- Distinguish people who were not eligible from eligible people who did not vote.
- Show population reference dates and election result status. Clearly label estimated eligibility breakdowns and explain differences between population and election records.
- Visualize available official data and list every official source used.
- Which additional states and election years to include remains open.

## Brand Commitments

Politically neutral: explain the data without endorsing parties or telling people how to vote. Use language ordinary readers can understand.

## Evidence on Hand

- `public/data/berlin/2023.json`: the reference election dataset and source references.
- `src/pages/[state]/[year].astro`: the shared election page, including the visualization, data table, methodology notes, and official source links.
- `scripts/download-data.mjs` and `scripts/process-data.mjs`: the official-data download and processing workflow.
- `DATA_SOURCES.md`: the proposed 2026 data-source plan.

## Product Principles

- Make the proportions of participation understandable to non-specialists.
- Present election data with political neutrality.
- Make every figure traceable to its official source.
- Keep denominators, dates, and estimates explicit so comparisons remain honest.
