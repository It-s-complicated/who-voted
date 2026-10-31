# Official election CSV availability

Reviewed on **1 October 2026** for the 19 elections currently in the catalog.
This review covers election results; population and demographic exports are a
separate question. The [source priority](ADDING_AN_ELECTION.md#1-collect-the-required-data)
still applies: equivalent official coverage and status come before format.

## Findings

Downloaded and compared **13 alternative official CSV exports** against
`public/data/<state>/<year>.json` at commit
`df53f30d49aa56b92b905401e9948ababea31418`. Every checked numerical field
matches, including **239 individual party counts**. Saarland had two existing
party-name typos, detailed below. The subsequent migration replaced 12 primary
result inputs and corrected those names; see the migration status below.

Berlin 2026 and Mecklenburg-Vorpommern 2026 already use CSV. No equivalent CSV
was found on the checked official download pages for the remaining four
elections; this is a bounded search result, not proof that none exists elsewhere.

### Downloaded alternatives

“Match” means every party count, eligible voters, voters, valid votes, and
reported invalid votes/ballots matched the existing JSON. The qualifications
for Niedersachsen and Bremen are part of the comparison, not waived checks.

| Election | Previous result input | Official alternative | Comparison and coverage |
| --- | --- | --- | --- |
| Baden-Württemberg 2026 | State HTML | [CSV](https://wahlen.statistik-bw.de/ltw26/ltw26-ergebnisse.csv), [results portal](https://wahlen.statistik-bw.de/ltw26/) | Match; 21 parties; statewide row, 11,570/11,570 districts. |
| Bayern 2023 | Federal HTML | [CSV](https://www.landtagswahl2023.bayern.de/08_10_2023_Landtagswahl_2023_Wahlkreise_Bayern.csv), [downloads](https://www.landtagswahl2023.bayern.de/downloads.html) | Match; 15 parties; combined first and second votes; 91/91 constituencies. |
| Bremen 2023 | PDF | [Statewide results table](https://www.wahlen-bremen.de/Wahlen/2023_05_14/): table download button → “Download als CSV” | Match for all exported counts; 16 parties. Returned/valid ballots and missing ballots are not separately exported. |
| Hamburg 2025 | PDF | [CSV/XLSX ZIP](https://suche.transparenz.hamburg.de/localresources/StaNord_CMS/StaNord_CMS66886/BUE2025_e_05.zip), [official catalog entry](https://suche.transparenz.hamburg.de/dataset/endgultiges-ergebnis-der-hamburger-burgerschaftswahl-2025-gesamtstimmen-der-landesliste-und-der) | Match; 16 parties; statewide Landesliste votes and all required ballot counts. |
| Hessen 2023 | Federal HTML | [CSV](https://wahlen.hessen-ltw23.23degrees.eu/assets/Wahlergebnisse_Landtagswahl.csv), [final-results portal](https://wahlen.hessen-ltw23.23degrees.eu/) | Match; 21 parties; statewide row, 6,889/6,889 districts; snapshot 27 October 2023. |
| Mecklenburg-Vorpommern 2021 | Federal HTML | [CSV](https://www.laiv-mv.de/static/LAIV/Wahlen/2-Landtagswahlen/2021/Ergebnisse/l_wahlkreise.csv), [downloads](https://www.laiv-mv.de/Wahlen/Landtagswahlen/2021/Ergebnisse/) | Match; 24 parties; statewide second votes, 2,003/2,003 districts. |
| Niedersachsen 2022 | Federal HTML | [CSV](https://wahlen.statistik.niedersachsen.de/LW2022/wahlergebnis.csv), [final-results portal](https://wahlen.statistik.niedersachsen.de/LW2022/) | Match; 14 parties; sum of all 87 constituencies. Invalid votes are derived, not directly exported. |
| Nordrhein-Westfalen 2022 | Federal HTML | [Semicolon CSV with `.txt` extension](https://www.wahlergebnisse.nrw/landtagswahlen/2022/LW22_WK_insgesamt.txt), [downloads](https://www.wahlergebnisse.nrw/landtagswahlen/2022/index.shtml) | Match; 29 parties; statewide second-vote row. |
| Rheinland-Pfalz 2026 | XLSX | [CSV](https://www.wahlen.rlp.de/fileadmin/wahlen.rlp.de/dokumente-wahlen/ltw/Ergebnisdateien/2026/LW_2026_Endergebnis_Stimmbezirksebene.csv), [results/downloads](https://www.wahlen.rlp.de/landtagswahl/ergebnisse) | Match; 12 parties; final statewide Landesstimmen row. |
| Saarland 2022 | Federal HTML | [CSV](https://wahlergebnis.saarland.de/LTW/KERG_SAARLAND.csv), [downloads](https://wahlergebnis.saarland.de/LTW/download.html) | All counts match; 18 parties; two existing name typos. |
| Sachsen-Anhalt 2021 | State HTML | [CSV](https://wahlergebnisse.sachsen-anhalt.de/wahlen/lt21/erg/csv/lt21dat1.csv), [downloads](https://wahlergebnisse.sachsen-anhalt.de/wahlen/lt21/and/lt.download.php) | Match; 22 parties; final statewide second-vote row. |
| Sachsen-Anhalt 2026 | State HTML | [CSV](https://wahlergebnisse.sachsen-anhalt.de/wahlen/lt26/downloads/Ergebnisse_Land_RKR_WKR_LT_2026.csv), [downloads](https://wahlergebnisse.sachsen-anhalt.de/wahlen/lt26/downloads.html) | Match; 15 parties; final statewide combined polling/mail row. |
| Schleswig-Holstein 2022 | Federal HTML | [CSV](https://www.wahlen-sh.de/ltw_2022/ergebnis-download.csv), [official metadata and party codes](https://www.govdata.de/suche/daten/ergebnisse-der-landtagswahl-2022) | Match; 16 parties; sum of 2,909 unique polling/mail districts. Metadata describes counted districts without explicitly labelling final status; verify status before migration. |

### Other catalog elections

| Election | Checked official page | Finding |
| --- | --- | --- |
| Berlin 2023 | [Downloads](https://www.wahlen-berlin.de/wahlen/BE2023/AFSPRAES/agh/downloads.html) | XLSX and PDF; retain the existing XLSX input. |
| Brandenburg 2024 | [Downloads](https://wahlergebnisse.brandenburg.de/12/500/20240922/landtagswahl_land/download.html) | XLSX and PDF; retain the existing XLSX input. |
| Sachsen 2024 | [Information and downloads](https://www.wahlen.sachsen.de/landtagswahlen-2024-informationen-und-downloads.html) | Final XLSX exports cover state/constituencies/municipalities and polling districts. An XLSX replacement for the current federal HTML is an option, but was not numerically compared in this CSV review. |
| Thüringen 2024 | [Results and Excel exports](https://wahlen.thueringen.de/landtagswahlen/lw_wahlergebnisse.asp) | Excel exports available; no CSV confirmed. Existing federal HTML retained; Excel files were not compared. |
| Berlin 2026 | Existing retained `results.csv` and party dictionary | Already uses CSV; no new snapshot compared in this review. |
| Mecklenburg-Vorpommern 2026 | Existing retained `results.csv` | Already uses CSV; no new snapshot compared in this review. |

## Numerical comparison

A one-off Python standard-library check read the downloaded files with
`csv.reader` (including quoted multiline cells), selected the rows described
below, and compared integer values to the existing JSON. It checked every
participating party by name/code mapping and verified that their sum equals
valid votes. Party order and percentages were ignored. Downloaded files were
kept in `/tmp` during research; the hashes below identify the reviewed bytes.

Every number in this table has **zero difference** from the existing dataset.
Invalid values are votes except for Bremen and Hamburg, where they are ballots.

| Election | Eligible | Voters | Valid votes | Invalid | Parties |
| --- | ---: | ---: | ---: | ---: | ---: |
| Baden-Württemberg 2026 | 7,764,858 | 5,406,737 | 5,375,109 | 31,628 | 21 |
| Bayern 2023 | 9,430,600 | 6,895,807 | 13,658,782 | 131,140 | 15 |
| Bremen 2023 | 460,778 | 262,099 | 1,263,908 | 6,698 ballots | 16 |
| Hamburg 2025 | 1,313,043 | 887,742 | 4,371,246 | 7,043 ballots | 16 |
| Hessen 2023 | 4,332,235 | 2,858,313 | 2,813,313 | 45,000 | 21 |
| Mecklenburg-Vorpommern 2021 | 1,312,471 | 928,807 | 913,863 | 14,944 | 24 |
| Niedersachsen 2022 | 6,064,738 | 3,657,967 | 3,623,886 | 34,081 derived | 14 |
| Nordrhein-Westfalen 2022 | 12,965,858 | 7,200,293 | 7,146,831 | 53,462 | 29 |
| Rheinland-Pfalz 2026 | 2,990,064 | 2,046,542 | 2,028,230 | 18,312 | 12 |
| Saarland 2022 | 746,307 | 458,113 | 452,411 | 5,702 | 18 |
| Sachsen-Anhalt 2021 | 1,788,930 | 1,079,045 | 1,063,697 | 15,348 | 22 |
| Sachsen-Anhalt 2026 | 1,706,852 | 1,327,991 | 1,315,282 | 12,709 | 15 |
| Schleswig-Holstein 2022 | 2,314,417 | 1,396,747 | 1,387,398 | 9,349 | 16 |

Hamburg's ballot fields also match independently: returned **887,183**, valid
**880,140**, invalid **7,043**; voters minus returned ballots gives **559**
without a Landesliste ballot. Bremen's CSV does not separately establish
`ballots.total`, `ballots.valid`, or `ballots.none`; do not count them as verified
from this export or infer zero missing ballots solely to make the arithmetic fit.

Niedersachsen's CSV establishes eligible voters, voters, valid votes and parties.
Its voter-minus-valid difference is **34,081**, matching the existing invalid
count, but the file does not independently distinguish invalid from uncast votes.
Retain official category-definition evidence or an additional invalid-vote table
before using this subtraction in an importer.

### Names and exceptional parsing

These source differences explain why a single CSV layout cannot be assumed:

- **Baden-Württemberg:** UTF-8/BOM, semicolon; select `Gebietsart=LAND`,
  `Gebietsnummer=BW`. Mixed aggregation levels would double-count if summed.
  Map `F1`–`F21` using the [official column description](https://www.statistik-bw.de/fileadmin/user_upload/Presse/Pressemitteilungen/2026021_LTW26-Hinweise-DSB.pdf).
  Its `PDH`/`Werteunion` labels correspond to existing `PdH`/`WerteUnion`.
- **Bayern:** Windows-1252, semicolon; select region `990`, current-year
  **Gesamtstimmen**, not Zweitstimmen alone. Ignore prior-election columns and
  the nonapplicable `X` in the historical “Sonstige” column. Repeated
  `Parteiname` headers must not overwrite vote columns in a dictionary.
- **Bremen:** browser-generated UTF-8/comma table export; German thousands
  separators. Select the statewide **Bürgerschaft** table, including Bremerhaven;
  Stadtbürgerschaft is a different election. CSV `Verjüngungsforschung` is the
  same party as existing `Partei für schulmedizinische Verjüngungsforschung`.
- **Hamburg:** ZIP member `BUE2025_e_05/Tabelle1.csv`, UTF-8/BOM, comma;
  quoted multiline cells and a formatted table rather than simple records.
  Select the **Landesliste** column; distinguish ballots from votes and do not
  add the “Heilungsregel” subtotal again.
- **Hessen:** UTF-8/BOM, semicolon, title row before headers. Select key
  `00000000000`, `Gebietstyp=LD`; use Landesstimmen, not Wahlkreisstimmen.
  `KLIMALISTE WÄHLERL.` maps to existing `KLIMALISTE WÄHLERLISTE`.
  The CSV link is in the portal's main menu; its availability was confirmed
  with a browser, not inferred from the [2023 format specification](https://statistik.hessen.de/sites/statistik.hessen.de/files/2023-09/Dateibeschreibung_Downloaddatei_Landtagswahl_2023_b.pdf).
- **Mecklenburg-Vorpommern 2021:** Windows-1252, semicolon, preamble;
  select `Ausgabe=A`, `Wahlkreis=99`, `Erst-/Zweitstimme=2`.
  `Einzelbewerber=x` is nonapplicable to second votes; the double space in
  `FREIE  WÄHLER` is a formatting difference.
- **Niedersachsen:** UTF-8/BOM, semicolon; exactly one row for each constituency
  1–87, no statewide row. Sum only ` II` party columns. Blank columns for
  nonparticipating second-vote parties do not add parties to the result.
- **Nordrhein-Westfalen:** UTF-8, semicolon despite `.txt`; preamble and two
  header rows. Select `Wahlkreisnr.=000`, `F` and populated `F1`–`F29`;
  the later blank columns refer to candidates without a state list.
- **Rheinland-Pfalz:** Windows-1252, semicolon, quoted multiline header cells.
  Select identification key `0`, type `LD`, combined row `G`. Party headings
  occur in both vote sections: use the **Landesstimmen** section only.
- **Saarland:** UTF-8/BOM, semicolon, multiple headers; select region `10`
  and **Endgültig**, skipping alternating **Vorperiode** columns. Full party
  names require an explicit mapping. Existing `ÖPD` (**613** votes) is a typo
  for **ÖDP**; existing `Die Humanistien` (**233** votes) corresponds to
  **Partei der Humanisten**. These were reported as name differences, not
  silently treated as exact name matches. Fix the import and regenerate when
  addressing them; do not hand-edit generated JSON.
- **Sachsen-Anhalt 2021:** Windows-1252, semicolon; `Ergebnisart=E`,
  `Satzart=LAN`, key `15`. Strip trailing spaces from party headers;
  `TIERSCHUTZ hier!` maps to existing `Tierschutz hier!`.
- **Sachsen-Anhalt 2026:** UTF-8/BOM, semicolon; `Ergebnisart=E`,
  `Satzart=LAN`, key `15`, **empty `Wahllokal`**. `U` and `B` are separate
  polling/mail subtotals; summing all three statewide rows doubles the result.
- **Schleswig-Holstein:** UTF-8/BOM, semicolon; only `STIMMBEZIRK` and
  `BRIEFWAHLBEZIRK` records. Verify uniqueness by constituency, municipality,
  district number and type, then sum each once. Use the official metadata's
  `F1`–`F16` dictionary. Agreement with every retained final count establishes
  numerical equivalence for this snapshot; it does not supply an explicit
  publisher status label.

## Migration status

Implemented on **1 October 2026**: Baden-Württemberg 2026, Bayern 2023,
Hamburg 2025, Hessen 2023, Mecklenburg-Vorpommern 2021, Niedersachsen 2022,
Nordrhein-Westfalen 2022, Rheinland-Pfalz 2026, Saarland 2022,
Sachsen-Anhalt 2021/2026, and Schleswig-Holstein 2022 now use these reviewed
CSV exports as their primary result inputs. Hamburg retains the published ZIP
and reads its CSV member. The obsolete primary HTML/PDF/XLSX files were removed;
downloader configuration, source URLs, checksums, precise locations and generated
provenance were updated together.

Niedersachsen and Schleswig-Holstein retain their previous official HTML as
`supplementary-results.html`. Every build compares eligible voters, voters,
valid votes and every party against it. Niedersachsen imports invalid votes
from that table rather than deriving them from an ambiguous remainder;
Schleswig-Holstein also checks its CSV invalid count against the published result.
This preserves the existing final-result evidence while using the CSV data.

Bremen retains its PDF import: the browser-generated CSV has no reusable
download URL and omits separate valid/returned/missing ballot counts. Its CSV
was compared for research, but has not replaced the retained production evidence.
The other four elections without confirmed CSV alternatives remain as listed.

The importer uses `csv-parse` to handle quoted/multiline fields. Literal
unescaped quotes in BW district names, NRW prose/headers and Berlin's party
dictionary require specifically documented exceptions. Do not enable those
exceptions for all publishers.

Regeneration was compared with all **19** pre-migration datasets: every
non-provenance field matches after the two Saarland spelling corrections.
Regression hashes in `scripts/check-data.mjs` preserve every data field for the
12 migrated elections. Shared population files, checksums, retrieval times and
demographic values were preserved.

## Reviewed download checksums

SHA-256 of the downloaded CSV bytes; Hamburg identifies the ZIP, and Bremen
identifies the file produced by the table's browser download button.

| Election | SHA-256 |
| --- | --- |
| Baden-Württemberg 2026 | `5afd94b13ee6af30c0ec63bdd2543ca3826f80d2281646a1f84d9f0e6a822866` |
| Bayern 2023 | `8f682891ddf8f03a4ae57585f1c808fbe9db629c54053f2bfbdb4b9d593ff15d` |
| Bremen 2023 | `47d502f76e9c43c4a34491b5b4f017a12eaa1217b2af4bfdef3401c12f8efbce` |
| Hamburg 2025 | `1088720b1e83a7b4b12f99e6c99e3aec4799bc69551587797ee2b71191d430e3` |
| Hessen 2023 | `9cdc9c8ea341e1de1756f0936e03ac92e784d898bece08b2e3580e77178dc823` |
| Mecklenburg-Vorpommern 2021 | `ad1ba0899aab43ead2db51cfe720921b902e929e4643469b2b0aa12dcdb31cf9` |
| Niedersachsen 2022 | `25316d1de8a18980080de7473e998ba2e8ca76e611e870445da53944ed34ee1b` |
| Nordrhein-Westfalen 2022 | `2b8c74f583b7b0cbd8e45be166087fb55932a5c04f4079481c990892997efd13` |
| Rheinland-Pfalz 2026 | `788eb62584181bc559b8dbc042788ef79a351ab5d4c3cc6c68bff89f3ce085a2` |
| Saarland 2022 | `49c9dc360edfde1d5ab90a4c637d1274509dbd55158f922b155e8487eaf3e77b` |
| Sachsen-Anhalt 2021 | `a2904509e0f48d79534d0afc65359a9c1294e26ebfce564d82b43882d2b8281c` |
| Sachsen-Anhalt 2026 | `17d87d956c1b9da7a7b1b113875497f5a5f781a1b89e0c0aed157aae09217c85` |
| Schleswig-Holstein 2022 | `b3b7bbf2780493a0788ce0abf845cb8179c2034fddc80069c1b9e79ba4aa902c` |
