# Official data availability review — all 16 states

Reviewed 12 September 2026 against the Berlin 2023 benchmark in [PRODUCT.md](PRODUCT.md#current-gold-standard-berlin-2023).

There are useful sources missing from the current pipeline. The strongest opportunities are the 2022 census for spring 2022 elections, quarterly population totals, and closer annual demographic snapshots already present in the downloaded archive. However, finding a closer total does not establish a complete, compatible age-and-citizenship breakdown.

This is a source-availability assessment, not a replacement of the committed datasets. Current dates, election ages and split status below were read from `public/data/*/*.json`; processing choices were checked in `scripts/process-data.mjs` and `scripts/state-sources.mjs`. Official web publications and database catalogs were checked for alternatives. Catalog-confirmed tables still need export, numerical reconciliation and source-basis checks before import. No new complete Sankey breakdown has been validated in this review.

## Sources we missed or underused

### 1. A census snapshot on NRW's election day

The Zensus 2022 reference date is **15 May 2022**: exactly NRW's election day, seven days after Schleswig-Holstein's election, and 49 days after Saarland's. The official catalog lists **1000A-2012**, single-year age crossed with citizenship/continent, and **1000A-2013**, single-year age crossed with citizenship country, including state-level results. These are promising sources for both under-voting-age residents and non-German residents at or above voting age. Prefer the German/non-German distinction over summing individual countries. [Official census catalog][census]

This is a substantially better timing candidate than the currently used 31 December 2021 snapshot. It is not yet a verified replacement: the database required JavaScript and the numerical cross-tab was not exported in this review. Check citizenship definitions, disclosure adjustments, age-cell availability and reconciliation with the electoral roll. Preserve any real statistical discrepancy rather than forcing the residual to zero.

### 2. Quarterly totals for every state

Destatis **12411-0021** provides population by state, quarter-end and sex; its catalog currently lists dates through 31 March 2026. It is a shared alternative to extracting previous-year totals from the Niedersachsen Monitor. It does **not** contain age or citizenship. The quarterly dates in the state table below are candidates for the denominator, not proof that a complete breakdown exists at those dates. [Official quarterly table][quarterly]

### 3. Closer annual data is already downloaded

The processor hard-codes `referenceDate = year - 1 + '-12-31'` for the 13 states outside Berlin, Hamburg and Bremen. The committed `genesis-12411-0014-flat.zip` already contains numeric records for these closer, post-election snapshots:

| Election | Current gap before election | Available year-end snapshot | Gap after election |
| --- | ---: | --- | ---: |
| Bayern / Hessen 2023 | 281 days | 31.12.2023 | 84 days |
| Brandenburg 2024 | 266 days | 31.12.2024 | 100 days |
| Mecklenburg-Vorpommern 2021 | 269 days | 31.12.2021 | 96 days |
| Niedersachsen 2022 | 282 days | 31.12.2022 | 83 days |
| Sachsen / Thüringen 2024 | 245 days | 31.12.2024 | 121 days |

These are alternatives to evaluate, not automatic upgrades: several remain months away, and post-election migration, birthdays and naturalisations change the population. Use a matching population total and demographic basis; explicitly label a post-election reference date. A source refresh alone will not change the processor's fixed date selection.

## State-by-state assessment

“Split” means the current JSON contains the estimated ineligibility breakdown, not that it meets the updated quality benchmark. All current gaps are before election day. “Unconfirmed” means this search did not establish a usable close-date age × citizenship table; it does not mean the data cannot be obtained.

| State / existing election | Current reference; gap; split | Official alternative or missed source | Assessment and next data step |
| --- | --- | --- | --- |
| **Baden-Württemberg — 08.03.2026** | 31.12.2025; 67 days; no | [Quarterly table][quarterly]: 31.03.2026, 23 days after. [State age tables][bw] include age × nationality. | Closer total available in the catalog; a March age × citizenship cross-tab is unconfirmed. Compare with the coherent December snapshot and investigate the negative residual. Election-specific structural data is also linked from the [official pre-election release][bw-election], but its estimated eligible count must not replace the actual electoral roll. |
| **Bayern — 08.10.2023** | 31.12.2022; 281 days; yes | [State population portal][bayern] lists Q3 2023 report A1200C 202343, monthly population data, annual age structure A1300C and foreign-population series A1500C. | 30.09.2023 is eight days before election day. Age structure is annual; test the already downloaded 31.12.2023 age × nationality snapshot as a closer fallback, or seek a September cross-tab. The existing visible split is temporally weak. |
| **Berlin — 12.02.2023** | 31.12.2022; 43 days; yes | The existing [register report][berlin] contains total population and German/foreign residents by age, on a common reference date. It is a half-yearly publication. | Retain as benchmark. No closer equivalent register cross-tab was established. A monthly population estimate would be a different statistical basis, not a drop-in improvement. |
| **Brandenburg — 22.09.2024** | 31.12.2023; 266 days; no | [September 2024 report][brandenburg], tables 1.1–1.3 and 1.5, has monthly totals and German/non-German counts; 30.09.2024 is eight days after election day. | A genuine citizenship-timing improvement, but no corresponding stock by single-year age in this report. It explicitly uses Zensus 2011, so do not combine it silently with revised Zensus 2022 age data. The downloaded December 2024 cross-tab is another candidate, with a 100-day gap. |
| **Bremen — 14.05.2023** | 31.12.2022; 134 days; yes | The inspected [Q1 2023 report][bremen] supplies Land-wide population and nationality totals at 31.03.2023. The listed Q2 PDF returned 404; quarter-end totals also have the national catalog route. | March is 44 days before election day. The report's tables 1–2 use Zensus 2011 Fortschreibung; table 3 uses the city register. A matching age × citizenship cross-tab is unconfirmed. Use age **16** and the whole Land, including Bremerhaven; do not substitute city-only data or municipal-election eligibility. |
| **Hamburg — 02.03.2025** | 31.12.2024; 61 days; yes | [Melderegister data][hamburg] provides annual resident characteristics; [the 2024 register publication][hamburg-2024] is already represented locally. | Timing is comparatively close. The actual missed detail is exact under-16 counts by citizenship on the same register basis. The importer currently applies a Fortschreibung under-16/under-18 ratio to register totals, including foreign minors. Seek an exact register cross-tab; the public catalog does not establish that export. |
| **Hessen — 08.10.2023** | 31.12.2022; 281 days; yes | [Quarterly table][quarterly]: 30.09.2023, eight days before. [Hessen's 2023 age report][hessen] and the existing annual archive offer closer year-end demographics. | Compare the September denominator with a compatible September demographic extract if obtainable; otherwise assess the coherent 31.12.2023 dataset, 84 days after election. A close-date age × citizenship cross-tab remains unconfirmed. |
| **Mecklenburg-Vorpommern — 26.09.2021** | 31.12.2020; 269 days; no | [Quarterly table][quarterly]: 30.09.2021, four days after. The [state report archive][mv] also exposes population and demographic series. | Quarter-end total is a strong timing candidate; matching age × citizenship is unconfirmed. The downloaded December 2021 demographic data is 96 days after election, closer than December 2020. |
| **Niedersachsen — 09.10.2022** | 31.12.2021; 282 days; no | [January 2023 Monatsheft][niedersachsen] publishes September 2022 population changes and the 30.09.2022 total, nine days before the election. | The report flags the Zensus revision. Seek matching September age × citizenship data; otherwise evaluate the already downloaded December 2022 cross-tab, 83 days after. The May census is 147 days before this election, so it is not the closest annual alternative. |
| **Nordrhein-Westfalen — 15.05.2022** | 31.12.2021; 135 days; no | [Zensus 2022 age × citizenship tables][census] describe the election date itself. | **Highest-priority demographic candidate.** Export the state-level table and reconcile census totals, under-18 residents, non-German adults and the electoral roll. Same-day timing still does not guarantee a nonnegative residual. |
| **Rheinland-Pfalz — 22.03.2026** | 31.12.2025; 81 days; no | [Quarterly table][quarterly]: 31.03.2026, nine days after. [State MATS tables][rlp] and [methodology][rlp-method] offer the route to more detailed population data. | Monthly demographic processing is documented, but availability of a public March age × citizenship export is unconfirmed. Check MATS or request that aggregate extract before replacing December data. |
| **Saarland — 27.03.2022** | 31.12.2021; 86 days; no | [Quarterly table][quarterly]: 31.03.2022, four days after; [Zensus cross-tabs][census]: 15.05.2022, 49 days after. | Compare a near-date total with the census's coherent demographic snapshot. The census may be the stronger complete-data candidate even though its total is less close. A March age × citizenship cross-tab was not established. |
| **Sachsen — 01.09.2024** | 31.12.2023; 245 days; yes | [Quarterly table][quarterly]: 30.09.2024, 29 days after; [state population portal][sachsen] links population databases and publications. | Seek a compatible near-election cross-tab; do not treat municipal register datasets as statewide coverage. The available December 2024 age × citizenship snapshot is closer than December 2023, but still 121 days after election. |
| **Sachsen-Anhalt — 06.06.2021** | 31.12.2020; 157 days; no | [Population report 30.06.2021][sachsen-anhalt] supplies a total 24 days after election day. | A close-date age × citizenship split is unconfirmed. Preserve this historical edition, but also address the missing **2026 election** below. |
| **Schleswig-Holstein — 08.05.2022** | 31.12.2021; 128 days; no | [Q1 2022 population report][sh] is 38 days before; [Zensus cross-tabs][census] are only seven days after. | **High-priority census candidate.** Single-year ages are needed for the **16-year** cutoff; a single “under 18” group is insufficient. Reconcile citizenship and census basis before enabling the split. |
| **Thüringen — 01.09.2024** | 31.12.2023; 245 days; yes | [Quarterly table][quarterly]: 30.09.2024, 29 days after. [TLS table catalog][thueringen] has mid-year totals, annual single-year ages and foreign-population age groups. | No near-election age × citizenship cross-tab confirmed. Evaluate December 2024 as a closer annual fallback and verify that foreign-age categories permit an exact 18-year cutoff. Existing split status alone is not sufficient. |

## Newly available election: Sachsen-Anhalt 2026

The project catalog was checked on 5 September and still identifies 2021 as the latest election. The official **6 September 2026** results page now reports **2,661 of 2,661 districts**, timestamped 8 September. The election authority schedules final statewide determination for **22 September 2026**. This is a candidate for a new edition with **preliminary** status, not a replacement of the 2021 historical dataset. [Official results][st-results], [election authority FAQ][st-faq]

The [state population tables][st-population] provide 2025 year-end age data; [state GENESIS][st-genesis] lists the election structural table `14311-SD` and a mid-year population table. These are leads to inspect for a 2026 edition. A near-September 2026 population-and-citizenship snapshot was not established; December 2025 alone would again be roughly eight months old. Do not use the FAQ's pre-election eligibility estimate in place of the actual result data.

## Consequences for source selection and annotations

1. **Choose a coherent demographic snapshot.** Prefer a close reference date for total residents, age and citizenship together. Record each component's date when they differ, its population basis (register, census or Fortschreibung), revision and exact table location. German citizens with another citizenship must not be counted as non-Germans. Migration background is not citizenship.
2. **Check statistical basis before arithmetic.** The Brandenburg report uses Zensus 2011; newer series can use Zensus 2022. The [RLP methodology][rlp-method] explicitly documents this break. AZR and population-estimate counts can also differ, as the [Bavarian methodology][bayern] explains. A positive remainder does not prove compatibility.
3. **Keep the age and citizenship groups disjoint.** Count everyone below the applicable voting age, then only non-Germans at or above that age. An all-age foreign count alone cannot supply the second band.
4. **Treat negative residuals as a diagnostic.** The existing documentation attributes them mainly to birthday cohorts, but this review does not establish that causal explanation. Reference-date changes, migration, citizenship changes, register differences and census revisions also need investigation. Do not choose a date merely because it makes the Sankey balance.
5. **Do not equate a note with data completeness.** When a reliable split remains unavailable, show what is missing and the demographic dates actually used. A generic estimation footnote cannot make a nine-month-old citizenship snapshot meet the Berlin benchmark.

Recommended order: validate NRW and Schleswig-Holstein census exports first; compare Saarland next; assess closer coherent annual snapshots for the seven autumn-election cases; pursue near-date aggregate age × citizenship extracts for unresolved states and exact register counts for Hamburg. Separately add the newly available Sachsen-Anhalt 2026 election after validating its preliminary results and demographic inputs.

The review found alternatives and specific remaining questions for all states, but did not prove that every state has a public election-date demographic cross-tab. Database catalog availability is distinguished above from inspected report content and from numerically validated imports.

[quarterly]: https://genesis.destatis.de/datenbank/online/statistic/12411/table/12411-0021
[census]: https://ergebnisse.zensus2022.de/datenbank/online/statistic/1000A/details
[bw]: https://www.statistik-bw.de/BevoelkGebiet/Alter/index.jsp
[bw-election]: https://www.statistik-bw.de/presse/pressemitteilungen/pressemitteilung/landtagswahl-2026-schaetzung-zur-zahl-der-wahlberechtigten/
[bayern]: https://www.statistik.bayern.de/statistik/gebiet_bevoelkerung/bevoelkerungsstand/
[berlin]: https://download.statistik-berlin-brandenburg.de/e501bddfe3150920/e07c5833fe8e/SB_A01-05-00_2022h02_BE.pdf
[brandenburg]: https://download.statistik-berlin-brandenburg.de/db59aa018cc95b19/366825c355b8/SB_A01-07-00_2024m09_BB.pdf
[bremen]: https://www.statistik.bremen.de/sixcms/media.php/13/2023-03_AI1vj_Bevoelkerungsstand_pdfa.pdf
[hamburg]: https://www.statistik-nord.de/zahlen-fakten/hamburger-melderegister
[hamburg-2024]: https://www.statistik-nord.de/zahlen-fakten/hamburger-melderegister/bevoelkerungsstand/dokumentenansicht/bevoelkerung-in-hamburg-am-31122024-67034
[hessen]: https://statistik.hessen.de/sites/statistik.hessen.de/files/2025-02/ai6_j23_aa.pdf
[mv]: https://www.laiv-mv.de/Statistik/Ver%C3%B6ffentlichungen/Statistische-Berichte/A/
[niedersachsen]: https://www.statistik.niedersachsen.de/download/192256
[rlp]: https://www.statistik.rlp.de/themen/bevoelkerung/daten
[rlp-method]: https://www.statistik.rlp.de/themen/bevoelkerung/hintergrund/metadaten
[sachsen]: https://www.statistik.sachsen.de/html/bevoelkerungsstand-einwohner.html
[sachsen-anhalt]: https://statistik.sachsen-anhalt.de/fileadmin/Bibliothek/Landesaemter/StaLa/startseite/Themen/Bevoelkerung/Berichte/Bevoelkerungsstand/6A102_01_21-A.pdf
[sh]: https://www.statistik-nord.de/fileadmin/Dokumente/Statistische_Berichte/bevoelkerung/A_I_1_vj_S/A_I_1_vj_22-1_Zensus_SH.pdf
[thueringen]: https://statistik.thueringen.de/datenbank/tabauswahl.asp?BEvas3=start&auswahl=121
[st-results]: https://wahlergebnisse.sachsen-anhalt.de/wahlen/lt26/erg_land.html
[st-faq]: https://wahlen.sachsen-anhalt.de/zu-den-wahlen/landtagswahl/faq-zur-landtagswahl-2026
[st-population]: https://statistik.sachsen-anhalt.de/themen/bevoelkerung-mikrozensus-freiwillige-haushaltserhebungen/bevoelkerung/tabellen-bevoelkerungsstand
[st-genesis]: https://genesis.sachsen-anhalt.de/genesis/online?operation=tables
