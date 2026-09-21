type ElectionMetadata = { electionDate: string; url: string };
type StateEntry = { name: string; elections: Record<number, ElectionMetadata> };

// Dates and result URLs belong to individual elections, never to a moving "latest" entry.
export function summarizeState(state: StateEntry) {
  const entries = Object.entries(state.elections);
  if (!entries.length) throw new Error(`${state.name}: no elections configured`);
  for (const [year, election] of entries) {
    const date = election?.electionDate;
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)
      || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date
      || date.slice(0, 4) !== year) {
      throw new Error(`${state.name}/${year}: missing or invalid electionDate`);
    }
    if (typeof election.url !== 'string' || !URL.canParse(election.url)
      || new URL(election.url).protocol !== 'https:') {
      throw new Error(`${state.name}/${year}: missing or invalid results URL`);
    }
  }
  const latest = entries.map(([, election]) => election)
    .toSorted((a, b) => b.electionDate.localeCompare(a.electionDate))[0];
  return {
    ...state,
    years: entries.map(([year]) => Number(year)),
    latestElection: latest.electionDate,
    resultsUrl: latest.url,
  };
}

// Only elections with local diagram datasets are listed.
const catalog: Record<string, StateEntry> = {
  "baden-wuerttemberg": {
    name: "Baden-Württemberg",
    elections: {
      2026: {
        electionDate: "2026-03-08",
        url: "https://wahlen.statistik-bw.de/ltw26/"
      }
    }
  },
  "bayern": {
    name: "Bayern",
    elections: {
      2023: {
        electionDate: "2023-10-08",
        url: "https://www.bundeswahlleiterin.de/service/landtagswahlen/land-9.html"
      }
    }
  },
  "berlin": {
    name: "Berlin",
    elections: {
      2023: {
        electionDate: "2023-02-12",
        url: "https://download.statistik-berlin-brandenburg.de/c6fffa8361dd1404/a8cc1bc593d9/DL_BE_AGHBVV2023.xlsx"
      },
      2026: {
        electionDate: "2026-09-20",
        url: "https://wahlen-berlin.de/wahlen/BE2026/Afspraes/AGH/Datenexport_AGH2026_Zweitstimme_A_BE.csv"
      }
    }
  },
  "brandenburg": {
    name: "Brandenburg",
    elections: {
      2024: {
        electionDate: "2024-09-22",
        url: "https://wahlergebnisse.brandenburg.de/12/500/20240922/landtagswahl_land/DL_BB_2_LT2024.xlsx"
      }
    }
  },
  "bremen": {
    name: "Bremen",
    elections: {
      2023: {
        electionDate: "2023-05-14",
        url: "https://www.statistik.bremen.de/sixcms/media.php/13/Statistische%20Mitteilungen_126_pdfa_Auflage2.pdf"
      }
    }
  },
  "hamburg": {
    name: "Hamburg",
    elections: {
      2025: {
        electionDate: "2025-03-02",
        url: "https://www.statistik-nord.de/fileadmin/Dokumente/BUE2025_e_05.pdf"
      }
    }
  },
  "hessen": {
    name: "Hessen",
    elections: {
      2023: {
        electionDate: "2023-10-08",
        url: "https://www.bundeswahlleiterin.de/service/landtagswahlen/land-6.html"
      }
    }
  },
  "mecklenburg-vorpommern": {
    name: "Mecklenburg-Vorpommern",
    elections: {
      2021: {
        electionDate: "2021-09-26",
        url: "https://www.bundeswahlleiterin.de/service/landtagswahlen/land-13.html"
      },
      2026: {
        electionDate: "2026-09-20",
        url: "https://wahlen.mvnet.de/dateien/ergebnisse.2026/landtagswahl/csv/l_wahlkreise.csv"
      }
    }
  },
  "niedersachsen": {
    name: "Niedersachsen",
    elections: {
      2022: {
        electionDate: "2022-10-09",
        url: "https://www.bundeswahlleiterin.de/service/landtagswahlen/land-3.html"
      }
    }
  },
  "nordrhein-westfalen": {
    name: "Nordrhein-Westfalen",
    elections: {
      2022: {
        electionDate: "2022-05-15",
        url: "https://www.bundeswahlleiterin.de/service/landtagswahlen/land-5.html"
      }
    }
  },
  "rheinland-pfalz": {
    name: "Rheinland-Pfalz",
    elections: {
      2026: {
        electionDate: "2026-03-22",
        url: "https://www.wahlen.rlp.de/fileadmin/wahlen.rlp.de/dokumente-wahlen/ltw/Ergebnisdateien/2026/Endgueltiges_Ergebnis_LW_2026_Wahlkreise.xlsx"
      }
    }
  },
  "saarland": {
    name: "Saarland",
    elections: {
      2022: {
        electionDate: "2022-03-27",
        url: "https://www.bundeswahlleiterin.de/service/landtagswahlen/land-10.html"
      }
    }
  },
  "sachsen": {
    name: "Sachsen",
    elections: {
      2024: {
        electionDate: "2024-09-01",
        url: "https://www.bundeswahlleiterin.de/service/landtagswahlen/land-14.html"
      }
    }
  },
  "sachsen-anhalt": {
    name: "Sachsen-Anhalt",
    elections: {
      2021: {
        electionDate: "2021-06-06",
        url: "https://www.bundeswahlleiterin.de/service/landtagswahlen/land-15.html"
      },
      2026: {
        electionDate: "2026-09-06",
        url: "https://wahlergebnisse.sachsen-anhalt.de/wahlen/lt26/erg_land.html"
      }
    }
  },
  "schleswig-holstein": {
    name: "Schleswig-Holstein",
    elections: {
      2022: {
        electionDate: "2022-05-08",
        url: "https://www.bundeswahlleiterin.de/service/landtagswahlen/land-1.html"
      }
    }
  },
  "thueringen": {
    name: "Thüringen",
    elections: {
      2024: {
        electionDate: "2024-09-01",
        url: "https://www.bundeswahlleiterin.de/service/landtagswahlen/land-16.html"
      }
    }
  }
};

export const states = Object.fromEntries(
  Object.entries(catalog).map(([slug, state]) => [slug, summarizeState(state)]),
);
