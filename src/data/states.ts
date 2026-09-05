// Latest completed elections, checked on 2026-09-05 against the Bundeswahlleiterin.
// years contains only elections with local diagram datasets.
export const states: Record<string, {
  name: string;
  years: number[];
  latestElection: string;
  resultsUrl: string;
}> = {
  "baden-wuerttemberg": {
    name: "Baden-Württemberg",
    years: [2026],
    latestElection: "2026-03-08",
    resultsUrl: "https://wahlen.statistik-bw.de/ltw26/",
  },
  "bayern": {
    name: "Bayern",
    years: [2023],
    latestElection: "2023-10-08",
    resultsUrl: "https://www.bundeswahlleiterin.de/service/landtagswahlen/land-9.html",
  },
  "berlin": {
    name: "Berlin",
    years: [2023],
    latestElection: "2023-02-12",
    resultsUrl: "https://www.bundeswahlleiterin.de/service/landtagswahlen/land-11.html",
  },
  "brandenburg": {
    name: "Brandenburg",
    years: [2024],
    latestElection: "2024-09-22",
    resultsUrl: "https://wahlen.brandenburg.de/sixcms/media.php/9/1.%20Landesergebnis%20gesamt_Internet.pdf",
  },
  "bremen": {
    name: "Bremen",
    years: [2023],
    latestElection: "2023-05-14",
    resultsUrl: "https://www.bundeswahlleiterin.de/service/landtagswahlen/land-4.html",
  },
  "hamburg": {
    name: "Hamburg",
    years: [2025],
    latestElection: "2025-03-02",
    resultsUrl: "https://www.bundeswahlleiterin.de/service/landtagswahlen/land-2.html",
  },
  "hessen": {
    name: "Hessen",
    years: [2023],
    latestElection: "2023-10-08",
    resultsUrl: "https://www.bundeswahlleiterin.de/service/landtagswahlen/land-6.html",
  },
  "mecklenburg-vorpommern": {
    name: "Mecklenburg-Vorpommern",
    years: [2021],
    latestElection: "2021-09-26",
    resultsUrl: "https://www.bundeswahlleiterin.de/service/landtagswahlen/land-13.html",
  },
  "niedersachsen": {
    name: "Niedersachsen",
    years: [2022],
    latestElection: "2022-10-09",
    resultsUrl: "https://www.bundeswahlleiterin.de/service/landtagswahlen/land-3.html",
  },
  "nordrhein-westfalen": {
    name: "Nordrhein-Westfalen",
    years: [2022],
    latestElection: "2022-05-15",
    resultsUrl: "https://www.bundeswahlleiterin.de/service/landtagswahlen/land-5.html",
  },
  "rheinland-pfalz": {
    name: "Rheinland-Pfalz",
    years: [2026],
    latestElection: "2026-03-22",
    resultsUrl: "https://www.wahlen.rlp.de/landtagswahl/ergebnisse",
  },
  "saarland": {
    name: "Saarland",
    years: [2022],
    latestElection: "2022-03-27",
    resultsUrl: "https://www.bundeswahlleiterin.de/service/landtagswahlen/land-10.html",
  },
  "sachsen": {
    name: "Sachsen",
    years: [2024],
    latestElection: "2024-09-01",
    resultsUrl: "https://www.bundeswahlleiterin.de/service/landtagswahlen/land-14.html",
  },
  "sachsen-anhalt": {
    name: "Sachsen-Anhalt",
    years: [2021],
    latestElection: "2021-06-06",
    resultsUrl: "https://www.bundeswahlleiterin.de/service/landtagswahlen/land-15.html",
  },
  "schleswig-holstein": {
    name: "Schleswig-Holstein",
    years: [2022],
    latestElection: "2022-05-08",
    resultsUrl: "https://www.bundeswahlleiterin.de/service/landtagswahlen/land-1.html",
  },
  "thueringen": {
    name: "Thüringen",
    years: [2024],
    latestElection: "2024-09-01",
    resultsUrl: "https://www.bundeswahlleiterin.de/service/landtagswahlen/land-16.html",
  },
};
