# Data pipeline review

Reviewed: 2026-09-05

## Assessment

Keep the static architecture. Serving all 16 German states should be straightforward; collecting consistent, trustworthy data will take most of the work. Improve the import pipeline before expanding coverage.

Current flow:

```text
Official PDF/XLSX/CSV sources
  → downloaded originals and checksum manifests
  → source-specific parsers
  → committed JSON datasets
  → Astro pages generated at build time
```

Visitors do not depend on source websites being available. Retained originals, checksums, and reproducible output are strengths of the current setup.

## Verification and scale

- Regenerated Berlin 2023, Hamburg 2025, and Bremen 2023 in a temporary directory. All three outputs matched the committed JSON exactly.
- Processing took approximately 0.16 seconds on the local machine. This is one measurement, not a benchmark.
- The three JSON datasets total 11,993 bytes (about 12 KB).
- Raw sources occupy approximately 8.3 MB.
- At comparable sizes, one election for each of 16 states remains a small static dataset. This estimate does not cover historical archives or more detailed geographic results.

## Prioritized work

### 1. Shared dataset validation — Major

Some current assertions only confirm arithmetic derived from the same inputs. For example, `eligible + (residents - eligible) === residents` cannot detect an incorrect source value. Validation is inconsistent across parsers.

- [ ] Add one shared validator used by every importer.
- [ ] Check required fields and finite, nonnegative integer counts.
- [ ] Check `voters <= eligible <= residents`.
- [ ] Check ballot reconciliation and party totals against independently extracted totals.
- [ ] Check valid votes against ballot vote capacity where applicable.
- [ ] Check completeness of demographic inputs before calculating estimates.
- [ ] Add a small runnable regression check demonstrating rejection of invalid data.

Relevant code: [scripts/process-data.mjs](scripts/process-data.mjs).

### 2. Explicit election data contract — Major

The shared page derives its data type from Berlin's JSON and casts other datasets into it. Berlin assumptions therefore leak into the shared contract. The `secondVotes` field also represents other voting systems.

- [ ] Define an explicit election data type independent of any individual JSON file.
- [ ] Represent vote labels, units, and applicable ballot rules explicitly.
- [ ] Validate datasets before rendering; a TypeScript assertion does not validate JSON.
- [ ] Preserve the distinction between people, ballots, votes, and vote-capacity shares.

Relevant code: [src/pages/[state]/[year].astro](src/pages/[state]/[year].astro).

### 3. Population comparability and estimation metadata — Major

Berlin and Hamburg use register counts; Bremen uses population estimates. Hamburg estimates under-16 counts using an age ratio from a different population series, including for foreign residents. These choices need to be visible when interpreting or comparing states.

- [ ] Record population basis and reference date explicitly.
- [ ] Record source locations, such as PDF pages, sheet names, or table identifiers, for important figures.
- [ ] Document estimation methods alongside the affected figures.
- [ ] Allow an unavailable eligibility breakdown instead of requiring an estimate for every state.
- [ ] Make the relevant population basis and estimation notes available on the rendered page.

Relevant code: [scripts/process-data.mjs](scripts/process-data.mjs), especially Hamburg's age-ratio calculation.

### 4. Election catalog and isolated importers — Major

Downloads, parser selection, routes, and diagram checks maintain separate election lists. The processor eagerly runs every parser and its assembly object supports only one entry per state. Adding elections requires coordinated edits across these locations.

- [ ] Introduce one election catalog keyed by `state/year`.
- [ ] Move source-specific parsing into small modules as part of this change.
- [ ] Support processing a selected election without processing all others.
- [ ] Derive available routes and checks from the catalog where practical.
- [ ] Keep source-layout differences inside their importers; avoid a universal scraper framework.

Relevant files:

- [scripts/download-data.mjs](scripts/download-data.mjs)
- [scripts/process-data.mjs](scripts/process-data.mjs)
- [src/data/states.ts](src/data/states.ts)
- [scripts/check-diagram.mjs](scripts/check-diagram.mjs)

### 5. Complete source refreshes — Major

The downloader overwrites files individually and writes the manifest only after all downloads succeed. A failed refresh can leave a mixture of source versions, with the previous manifest no longer matching the files. Unknown requested election IDs currently result in no work without an error.

- [ ] Download and validate a complete election snapshot in a staging location before replacing the previous snapshot.
- [ ] Preserve the previous usable snapshot when a refresh fails.
- [ ] Reject unknown requested election IDs.

Relevant code: [scripts/download-data.mjs](scripts/download-data.mjs).

### 6. Documentation and automated checks — Minor

README still describes the pipeline as Berlin-specific despite the Hamburg and Bremen implementations. Deployment runs only the site build, and the diagram regression script is not included in `test`.

- [ ] Update README to describe the current workflow and supported elections.
- [ ] Clarify that DATA_SOURCES.md describes the proposed Berlin 2026 update, not all current datasets.
- [ ] Run regeneration and compare generated output with committed JSON in CI.
- [ ] Include diagram regression checks after the site build.
- [ ] Keep deployment independent of live source downloads.

Relevant files: [README.md](README.md), [DATA_SOURCES.md](DATA_SOURCES.md), [package.json](package.json), [netlify.toml](netlify.toml).

## Renderer expansion issue

The renderer currently requires FDP to be present and has no fallback color for unfamiliar parties. A new dataset can fail the build or render with missing colors.

- [ ] Remove the assumption that every dataset must contain FDP while preserving the intended display policy when it is present.
- [ ] Supply a fallback color for parties outside the existing color mapping.

Relevant code: [src/pages/[state]/[year].astro](src/pages/[state]/[year].astro), party selection and color handling.

## Recommended sequence

1. Add the shared validator and explicit election data contract.
2. Address the renderer's party assumptions.
3. Add the next state to test the contract against a new source and voting system.
4. Consolidate the election catalog and isolate importers while adding targeted processing.
5. Improve refresh handling, methodology metadata, documentation, and CI checks.

Retain source-specific importers feeding one validated dataset format. Prefer structured official downloads where available and keep PDF extraction as a fallback. Each source still needs interpretation and verification.

The current workload does not justify a database, API server, queue, or parallel processing. Reconsider those only when a concrete requirement or measurement calls for them.

## Scope of this review

This assessment examined the local implementation and reproduced its current outputs. It did not independently audit every source figure or research source availability and election rules for the remaining states. No application code was changed during the review.
