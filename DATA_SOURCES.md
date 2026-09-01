# Data source plan

Scope: a Berlin-wide Sankey for the Abgeordnetenhaus election on 20 September 2026, based on second votes (`Zweitstimmen`).

## Flows

1. Residents → eligible / not eligible
2. Eligible → voters / non-voters
3. Voters → valid second votes / no valid second vote
4. Valid second votes → parties / other parties

Use counts for every flow and calculate percentages against the same resident total. Keep the source date beside the population figure because population and election data have different reference dates.

## Sources

| Data | Primary source | Fields needed | Availability |
| --- | --- | --- | --- |
| Election results | [Amt für Statistik Berlin-Brandenburg: Berliner Wahlen](https://www.statistik-berlin-brandenburg.de/abgeordnetenhauswahlen-bvv-berlin/) | Eligible voters, voters, valid/invalid second votes, second votes per party | Preliminary: election night, 20–21 Sep 2026. Final: scheduled for 12 Oct 2026. |
| Election rules | [Landeswahlleiter FAQ](https://www.berlin.de/wahlen/wahlen/berliner-wahlen-2026/fragen-und-antwortkatalog/artikel.1646712.php) | German citizenship, age 16+, three months' residence in Berlin, no court-ordered loss of voting rights | Available now |
| Election-specific demographics | The `Vorwahldaten, Strukturdaten` PDF/XLSX on the [AfS election page](https://www.statistik-berlin-brandenburg.de/abgeordnetenhauswahlen-bvv-berlin/) | Residents by age and citizenship; preferably the Berlin-total row | Available now |
| Population fallback/cross-check | [AfS Einwohnerbestand, 30 June 2026](https://www.statistik-berlin-brandenburg.de/a-i-5-hj/) | Total residents, age, citizenship | Available now |
| Official timetable | [Landeswahlleiter timetable, dated 17 Aug 2026](https://www.berlin.de/wahlen/wahlen/berliner-wahlen-2026/allgemeine-informationen/20260817_terminplan.pdf) | Result milestones | Available now |

Download and retain the original XLSX/CSV files rather than scraping formatted web tables. Record each file's URL, retrieval time, reference date, result status (`preliminary` or `final`), and licence.

## Calculations

```text
not_eligible = residents - eligible
non_voters = eligible - voters
no_valid_second_vote = voters - valid_second_votes
other_parties = valid_second_votes - sum(displayed_parties)
```

For an optional estimate of why residents were not eligible:

```text
under_16 = residents aged 0–15
non_german_16_plus = non-German residents aged 16+
other_or_timing_difference = not_eligible - under_16 - non_german_16_plus
```

Label that breakdown as an estimate. The resident register cannot exactly reproduce the electoral roll: its reference date differs, and the three-month residence rule and court exclusions are not fully represented.

Use `voters - valid_second_votes` for the conserved Sankey flow. Do not assume `valid + invalid = voters`; a voter can return no second vote, and the official tables may report ballots and voters separately. Party counts must sum to valid second votes.

## Publication stages

| Date | Expected data | App label |
| --- | --- | --- |
| 20–21 Sep 2026 | Preliminary result after all voting districts report | `Preliminary result` |
| 2 Oct 2026 | Results fixed by the district election committees | Still preliminary statewide |
| 12 Oct 2026 | Result fixed by the Berlin state election committee | `Final result` |
| By 1 Nov 2026 | Formal public notice deadline | No data change expected unless corrections are published |
