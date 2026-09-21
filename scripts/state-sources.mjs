import { readFileSync } from 'node:fs';
import { states } from '../src/data/states.ts';

// ponytail: the flat-table request body is the browser export's exact payload
// (all Stichtage 2000-2025); the API rejects anything less complete. Regenerate
// from a fresh table download if Destatis changes the export schema.
const genesisRequest = JSON.parse(`{"variableBlocks":{"v1":{"mainAttributes":[{"attribute":"2000-12-31","isDocumentary":false},{"attribute":"2001-12-31","isDocumentary":false},{"attribute":"2002-12-31","isDocumentary":false},{"attribute":"2003-12-31","isDocumentary":false},{"attribute":"2004-12-31","isDocumentary":false},{"attribute":"2005-12-31","isDocumentary":false},{"attribute":"2006-12-31","isDocumentary":false},{"attribute":"2007-12-31","isDocumentary":false},{"attribute":"2008-12-31","isDocumentary":false},{"attribute":"2009-12-31","isDocumentary":false},{"attribute":"2010-12-31","isDocumentary":false},{"attribute":"2011-12-31","isDocumentary":false},{"attribute":"2012-12-31","isDocumentary":false},{"attribute":"2013-12-31","isDocumentary":false},{"attribute":"2014-12-31","isDocumentary":false},{"attribute":"2015-12-31","isDocumentary":false},{"attribute":"2016-12-31","isDocumentary":false},{"attribute":"2017-12-31","isDocumentary":false},{"attribute":"2018-12-31","isDocumentary":false},{"attribute":"2019-12-31","isDocumentary":false},{"attribute":"2020-12-31","isDocumentary":false},{"attribute":"2021-12-31","isDocumentary":false},{"attribute":"2022-12-31","isDocumentary":false},{"attribute":"2023-12-31","isDocumentary":false},{"attribute":"2024-12-31","isDocumentary":false},{"attribute":"2025-12-31","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false}],"mainVariable":"STAG","showVariable":"LIKE_GENESIS","showVariableValue":["LABEL"],"labelOverwrite":{"de":"Stichtag","en":"Reference date","wiki":false},"idOverwrite":"STAG","sorting":{"direction":"ASC","sortBy":"NONE","sortLanguage":"NONE"},"lockSelection":false,"showAsInterline":true,"id":0,"isHidden":false},"v2":{"mainAttributes":[{"attribute":"NATD","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"NATA","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"%TOTAL%","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false}],"mainVariable":"NAT","showVariable":"NONE","showVariableValue":["LABEL"],"labelOverwrite":{"de":"Nationalität","en":"Nationality","wiki":false},"idOverwrite":"NAT","sorting":{"direction":"ASC","sortBy":"NONE","sortLanguage":"NONE"},"lockSelection":false,"showAsInterline":false,"id":0,"isHidden":false},"v3":{"mainAttributes":[{"attribute":"GESM","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"GESW","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"%TOTAL%","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false}],"mainVariable":"GES","showVariable":"NONE","showVariableValue":["LABEL"],"labelOverwrite":{"de":"Geschlecht","en":"Sex","wiki":false},"idOverwrite":"GES","sorting":{"direction":"ASC","sortBy":"CODE","sortLanguage":"DE"},"lockSelection":false,"showAsInterline":false,"id":0,"isHidden":false},"v4":{"mainAttributes":[{"attribute":"08","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"09","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"11","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"12","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"04","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"02","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"06","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"13","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"03","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"05","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"07","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"10","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"14","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"15","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"01","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"16","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false}],"mainVariable":"DLAND","showVariable":"LIKE_GENESIS","showVariableValue":["LABEL"],"labelOverwrite":{"de":"Bundesländer","en":"Länder","wiki":false},"idOverwrite":"DLAND","sorting":{"direction":"ASC","sortBy":"LABEL","sortLanguage":"DE"},"lockSelection":false,"showAsInterline":true,"id":0,"isHidden":false},"v5":{"mainAttributes":[{"attribute":"ALT000","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT001","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT002","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT003","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT004","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT005","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT006","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT007","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT008","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT009","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT010","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT011","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT012","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT013","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT014","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT015","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT016","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT017","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT018","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT019","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT020","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT021","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT022","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT023","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT024","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT025","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT026","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT027","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT028","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT029","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT030","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT031","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT032","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT033","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT034","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT035","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT036","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT037","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT038","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT039","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT040","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT041","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT042","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT043","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT044","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT045","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT046","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT047","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT048","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT049","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT050","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT051","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT052","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT053","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT054","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT055","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT056","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT057","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT058","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT059","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT060","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT061","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT062","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT063","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT064","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT065","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT066","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT067","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT068","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT069","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT070","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT071","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT072","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT073","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT074","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT075","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT076","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT077","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT078","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT079","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT080","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT081","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT082","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT083","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT084","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT085","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT086","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT087","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT088","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT089","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"ALT090UM","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false},{"attribute":"%TOTAL%","childVariable":null,"childAttributes":[],"isHidden":false,"isDocumentary":false}],"mainVariable":"ALT103","showVariable":"LIKE_GENESIS","showVariableValue":["LABEL"],"labelOverwrite":{"de":"Altersjahre","en":"Age","wiki":false},"idOverwrite":"ALT103","sorting":{"direction":"ASC","sortBy":"CODE","sortLanguage":"DE"},"lockSelection":false,"showAsInterline":false,"id":0,"isHidden":false}},"contentBlocks":{"c1":{"content":"BEVSTD","functions":["QMU"],"possibleFunctions":[],"functionDecimalDigits":{"QMU":0},"labelOverwrite":{"de":"Bevölkerungsstand","en":"Population","wiki":false},"idOverwrite":552374,"lockSelection":true,"showAsInterline":false,"isHidden":false}},"statisticBlocks":{"s1":{"statisticCode":"12411","showAsInterline":false,"isHidden":false}},"tableStructure":{"filter":[{"blockCode":"s1","blockType":"STATISTIC","childBlocks":[{"blockCode":"c1","blockType":"CONTENT","childBlocks":[],"possibleBlocks":[]}],"possibleBlocks":[]}],"colTitle":[{"blockCode":"v2","blockType":"VARIABLE","childBlocks":[{"blockCode":"v3","blockType":"VARIABLE","childBlocks":[],"possibleBlocks":[]}],"possibleBlocks":[]}],"rowTitle":[{"blockCode":"v1","blockType":"VARIABLE","childBlocks":[{"blockCode":"v4","blockType":"VARIABLE","childBlocks":[{"blockCode":"v5","blockType":"VARIABLE","childBlocks":[],"possibleBlocks":[]}],"possibleBlocks":[]}],"possibleBlocks":[]}]},"displayOption":{"showQualityInCells":true,"hideEmptyCols":false,"hideEmptyRows":false,"lockTranspose":false,"lockStructureModification":false,"fixFirstColumn":false}}`);

const annualPopulation = {
  url: 'https://genesis.destatis.de/genesis/api/rest/tables/12411-0014/download/ffcsv/de',
  method: 'POST',
  body: genesisRequest,
  file: 'data/raw/population/genesis-12411-0014-flat.zip',
  publisher: 'Statistisches Bundesamt (Destatis)',
  location: 'Tabelle 12411-0014, Bevölkerung nach Altersjahren und Nationalität, Stichtag 31.12.',
};



const censusPopulation = {
  url: 'https://ergebnisse.zensus2022.de/proxy/api/rest/tables/1000A-2012/download/ffcsv/de',
  method: 'POST',
  body: JSON.parse(readFileSync(new URL('./census-request.json', import.meta.url), 'utf8')),
  file: 'data/raw/population/zensus-1000A-2012-flat.zip',
  publisher: 'Statistische Ämter des Bundes und der Länder',
  location: 'Zensus 2022, Tabelle 1000A-2012, Bundesländer, Altersjahre, Staatsangehörigkeit',
};

const stateResults = {
  'berlin/2023': {
    file: 'results.xlsx', publisher: 'Amt für Statistik Berlin-Brandenburg',
    license: 'CC BY 3.0 DE',
    location: 'AGH_W2, Summe aller 3764 Wahlbezirke (Urnen- und Briefwahl), Zweitstimmen',
  },
  'berlin/2026': {
    file: 'results.csv', csvHeader: 'Adresse;StimmArt;',
    publisher: 'Amt für Statistik Berlin-Brandenburg', resultStatus: 'preliminary',
    location: 'Zweitstimmen, Landeszeile GI9900; WberIns, Waehler, Gueltig, Unguelt, P01–P120; 4114/4114 Wahlbezirke',
  },
  'mecklenburg-vorpommern/2026': {
    file: 'results.csv', csvHeader: 'Wahl zum Landtag von Mecklenburg-Vorpommern am 20. September 2026',
    publisher: 'Landeswahlleiter Mecklenburg-Vorpommern', resultStatus: 'preliminary',
    location: 'Wahlkreis 99, Ausgabe A, Erst-/Zweitstimme 2; Landesergebnis, 1974/1974 Wahlbezirke',
  },
  'sachsen-anhalt/2021': {
    file: 'results.html',
    publisher: 'Die Bundeswahlleiterin',
    location: 'Landtagswahl 2021, Landesergebnis',
  },
  'sachsen-anhalt/2026': {
    file: 'results.html',
    publisher: 'Statistisches Landesamt Sachsen-Anhalt',
    resultStatus: 'preliminary',
    location: 'Landesergebnis, eingebettete Tabelle ergtable, Zweitstimmen (anzahl.wj.x)',
  },
  'baden-wuerttemberg/2026': {
    file: 'state-results.html',
    publisher: 'Statistisches Landesamt Baden-Württemberg',
    location: 'Ergebnistabelle, Land Baden-Württemberg, Zweitstimmen',
  },
  'brandenburg/2024': {
    file: 'results.xlsx',
    publisher: 'Amt für Statistik Berlin-Brandenburg',
    location: 'Brandenburg_Landtagswahl_A_2, Landeszeile GI9900, Zweitstimmen (Anzahl)',
  },
  'rheinland-pfalz/2026': {
    file: 'results.xlsx',
    publisher: 'Landeswahlleiter Rheinland-Pfalz',
    location: 'LW_2026_WK, Summe der 52 Wahlkreise (KZ G), Landesstimmen',
  },
};

export const stateSources = Object.fromEntries(
  Object.entries(states)
    .filter(([slug]) => !['hamburg', 'bremen'].includes(slug))
    .flatMap(([slug, state]) => state.years.map((year) => {
      const route = `${slug}/${year}`;
      const result = stateResults[route] ?? {
        file: 'results.html',
        publisher: 'Die Bundeswahlleiterin',
        location: 'Ergebnis der Landtagswahl, Landesergebnis',
      };
      const { electionDate, url } = state.elections[year];
      const census = ['nordrhein-westfalen/2022', 'schleswig-holstein/2022', 'saarland/2022'].includes(route);
      const referenceDate = census ? '2022-05-15' : `${Math.min(2025, Number(electionDate.slice(5, 7)) >= 7 ? year : year - 1)}-12-31`;
      return [route, {
        results: { ...result, electionDate, url, file: `data/raw/${route}/${result.file}` },
        ...(route === 'berlin/2026' ? {
          description: {
            url: 'https://wahlen-berlin.de/wahlen/BE2026/Afspraes/AGH/DSB/DSB_Datenexport_AGH2026_Zweitstimme_A_BE.csv',
            file: `data/raw/${route}/description.csv`, csvHeader: '1. Allgemeines;',
            publisher: result.publisher, location: 'Datensatzbeschreibung: Datum (JJ.MM.TT), StimmArt, P01–P120',
          },
          summary: {
            url: 'https://wahlen-berlin.de/wahlen/BE2026/Afspraes/AGH/ergebnisse.html',
            file: `data/raw/${route}/summary.html`, publisher: result.publisher,
            location: 'Vorläufiges Ergebnis, Berlin, Zweitstimmen; unabhängiger Abgleich der CSV-Zahlen',
          },
        } : {}),
        population: {
          ...(census ? censusPopulation : annualPopulation),
          referenceDate,
          basis: census ? 'Zensus 2022' : `Bevölkerungsfortschreibung auf Basis des Zensus ${referenceDate < '2022-01-01' ? 2011 : 2022}`,
        },
      }];
    })),
);
