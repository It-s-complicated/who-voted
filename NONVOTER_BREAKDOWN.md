# Non-voter breakdown (Unter 18 / Nichtdeutsche / Sonstige Differenzen)

The diagrams for Berlin, Hamburg and Bremen split the non-eligible population
into three estimated bands: "Unter <Wahlalter>", "Nichtdeutsche <Wahlalter>+" and
a small "Sonstige Differenzen*" remainder. Bayern, Hessen, Sachsen and Thüringen
now do the same. The other nine states show an overall note instead. This file
explains why.

## Method

The split is an estimate from official population by single-year age and
nationality at 31 December (Destatis table
[12411-0014](https://genesis.destatis.de/genesis/api/rest/tables/12411-0014/download/ffcsv/de),
Bevölkerung: Bundesländer, Stichtag, Nationalität, Geschlecht, Altersjahre,
fetched anonymously as a flat CSV export):

- `underVotingAge` = residents younger than the state's voting age (16 in
  Baden-Württemberg, Brandenburg, Schleswig-Holstein; 18 elsewhere)
- `nonGermanVotingAgeOrOlder` = non-Germans aged voting age or older
- `otherOrTimingDifference` = remainder, so the three bands sum exactly to
  `notEligible = residents − Wahlberechtigte`

`scripts/process-data.mjs` computes this automatically and only emits the split
when the remainder stays nonnegative. The diagram pages mark the remainder with
`*` and explain it as a Schätzung: register and Wählerverzeichnis have different
reference dates and revision states; minimum residence periods and voting-right
exclusions are not fully representable.

## Why only some states get the split

The bands must sum exactly to "Nicht wahlberechtigt". That fails when
`Wahlberechtigte` (compiled on election day) exceeds the German residents of
voting age at the 31 December reference date — then under-18 plus non-German-18+
would exceed the not-eligible group and the remainder goes negative. The dominant
effect is the birthday cohort: everyone born early in the election year turns 16
or 18 after the reference date but is eligible on election day. For a state
election in spring/autumn, that cohort is roughly 0.3–0.6 % of the population;
Berlin avoids it because its reference date (31 December 2022) is only six weeks
before the election (12 February 2023).

Split status after the September 2026 data refresh:

| State | Reference date | Remainder | Split shown |
| --- | --- | --- | --- |
| Bayern | 31.12.2022 | +97.441 | yes |
| Hessen | 31.12.2022 | +95.229 | yes |
| Sachsen | 31.12.2023 | +7.274 | yes |
| Thüringen | 31.12.2023 | +9.178 | yes |
| Baden-Württemberg | 31.12.2025 | −23.531 | no |
| Brandenburg | 31.12.2023 | −2.869 | no |
| Mecklenburg-Vorpommern | 31.12.2020 | −9.149 | no |
| Niedersachsen | 31.12.2021 | −46.468 | no |
| Nordrhein-Westfalen | 31.12.2021 | −172.017 | no |
| Rheinland-Pfalz | 31.12.2025 | −29.651 | no |
| Saarland | 31.12.2021 | −8.588 | no |
| Sachsen-Anhalt | 31.12.2020 | −18.796 | no |
| Schleswig-Holstein | 31.12.2021 | −27.538 | no |

Inventing numbers to close a negative remainder would break the verified-data
rule, so those states keep the note. The split re-appears automatically once a
data refresh makes the arithmetic valid — no code change needed.

## Data plumbing

- `scripts/state-sources.mjs` — the `breakdown` source (POST with the exact
  browser-export payload; the API rejects trimmed bodies and needs
  `Origin`/`Referer` headers). Shared file: `data/raw/population/genesis-12411-0014-flat.zip`.
- `scripts/download-data.mjs` — POST support, dedupe by URL + body.
- `scripts/process-data.mjs` — `nonVoterBreakdown()`: age×nationality parser and
  the nonnegative-residual guard.
- `scripts/check-data.mjs` — pins the four states' breakdown values and rejects
  corrupted breakdowns.
