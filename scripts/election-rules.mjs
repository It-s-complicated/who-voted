// Rules checked against election-specific official references on 2026-09-14.
// See ELECTION_RULES.md for the source table; result columns refer to retained raw files.
// votesPerVoter counts the vote category shown in the diagram, not all ballot choices.
// Add an exact election entry only after checking its rules and source columns.
// resultColumn is zero-based; non-HTML layouts select columns in their own parser.
const rules = {
  'hamburg/2025': {
    votingAge: 16, voteLabel: 'Landesstimmen', votesPerVoter: 5,
    sources: [
      { url: 'https://www.statistik-nord.de/fileadmin/Dokumente/Glossar_B%C3%BCrgerschaftswahl_2025_Hamburg.pdf', publisher: 'Statistikamt Nord', location: 'Glossar zur Bürgerschaftswahl 02.03.2025, Seiten 3 und 5: Landesstimmen und Wahlberechtigte' },
    ],
  },
  'bremen/2023': {
    votingAge: 16, voteLabel: 'Stimmen', votesPerVoter: 5,
    sources: [
      { url: 'https://landesportal.bremen.de/die-wahl-der-buergerschaft', publisher: 'Freie Hansestadt Bremen', location: 'Wahlalter und fünf Stimmen; Seite verweist ausdrücklich auf die Bürgerschaftswahl 2023' },
    ],
  },
  'berlin/2023': {
    votingAge: 18, voteLabel: 'Zweitstimmen', votesPerVoter: 1,
    sources: [
      { url: 'https://www.berlin.de/wahlen/historie/berliner-wahlen/ergebnisberichte/sb_b07-02-03_2023j05_be_79a.pdf', publisher: 'Landeswahlleiter für Berlin', location: 'Erläuterungen A_2 zur Wiederholungswahl 2023, PDF-Seite 174: Wahlberechtigte und Zweitstimme' },
    ],
  },
  'baden-wuerttemberg/2026': {
    votingAge: 16, voteLabel: 'Zweitstimmen', votesPerVoter: 1, resultColumn: 4,
    sources: [
      { url: 'https://www.statistik-bw.de/presse/pressemitteilungen/pressemitteilung/landtagswahl-2026-wahlen-in-zahlen/', publisher: 'Statistisches Landesamt Baden-Württemberg', location: 'Pressemitteilung 35/2026, 26.02.2026: Mindestalter und Zwei-Stimmen-System' },
    ],
  },
  'bayern/2023': {
    sources: [
      { url: 'https://www.statistik.bayern.de/presse/mitteilungen/2023/pm09/index.html', publisher: 'Bayerisches Landesamt für Statistik', location: 'Pressemitteilung 09/2023: Stimmberechtigung' },
      { url: 'https://www.statistik.bayern.de/presse/mitteilungen/2023/pm08/index.html', publisher: 'Bayerisches Landesamt für Statistik', location: 'Pressemitteilung 08/2023: Erst- und Zweitstimmen, Gesamtstimmen' },
    ],
    votingAge: 18, voteLabel: 'Gesamtstimmen', votesPerVoter: 2, resultColumn: 1,
    unitNote: 'In Bayern zählen Erst- und Zweitstimmen zusammen für die Sitzverteilung. Jede Person hat zwei Stimmen. Ab den gültigen Gesamtstimmen zeigen die Bänder Stimmen geteilt durch zwei; sie lassen sich nicht einzelnen Personen zuordnen.',
  },
  'brandenburg/2024': {
    votingAge: 16, voteLabel: 'Zweitstimmen', votesPerVoter: 1,
    sources: [
      { url: 'https://wahlen.brandenburg.de/sixcms/media.php/9/LTW24-Brosch%C3%BCre_Komplett_final.4483527.pdf', publisher: 'Landeswahlleiter Brandenburg', location: 'Landtagswahl 2024, BbgLWahlG §§ 1 und 5, PDF-Seiten 59–60' },
    ],
  },
  'hessen/2023': {
    votingAge: 18, voteLabel: 'Landesstimmen', votesPerVoter: 1, resultColumn: 3,
    sources: [
      { url: 'https://statistik.hessen.de/sites/statistik.hessen.de/files/2023-10/BVII2_3_5j23.pdf', publisher: 'Hessisches Statistisches Landesamt', location: 'Landtagswahl 08.10.2023, Vorbemerkungen, PDF-Seite 4: Wahlsystem und Wahlberechtigung' },
    ],
  },
  'mecklenburg-vorpommern/2021': {
    votingAge: 18, voteLabel: 'Zweitstimmen', votesPerVoter: 1, resultColumn: 3,
    sources: [
      { url: 'https://www.laiv-mv.de/static/LAIV/Wahlen/Linker%20Seiteninhalt/LTW%20und%20KW%20in%20MV%202021%20-%20Stand%20August%202021.pdf', publisher: 'Landeswahlleiter Mecklenburg-Vorpommern', location: 'Wahlrechtsbroschüre, Stand August 2021, LKWG M-V §§ 4 und 53, PDF-Seiten 29 und 50' },
    ],
  },
  'niedersachsen/2022': {
    votingAge: 18, voteLabel: 'Zweitstimmen', votesPerVoter: 1, resultColumn: 3,
    sources: [
      { url: 'https://landeswahlleiterin.niedersachsen.de/download/188302/Presseinformation_Nr._7_zur_Landtagswahl_am_9._Oktober_2022.pdf', publisher: 'Niedersächsische Landeswahlleiterin', location: 'Presseinformation zur Landtagswahl 09.10.2022, Abschnitte 1 und 2, PDF-Seiten 1–2' },
    ],
  },
  'nordrhein-westfalen/2022': {
    votingAge: 18, voteLabel: 'Zweitstimmen', votesPerVoter: 1, resultColumn: 3,
    sources: [
      { url: 'https://www.im.nrw/landeswahlleiter-stellt-die-wichtigsten-zahlen-zur-nrw-landtagswahl-vor', publisher: 'Ministerium des Innern Nordrhein-Westfalen / Landeswahlleiter', location: 'Pressemitteilung 04.05.2022: Zweitstimme und Wahlberechtigte' },
    ],
  },
  'rheinland-pfalz/2026': {
    votingAge: 18, voteLabel: 'Landesstimmen', votesPerVoter: 1,
    sources: [
      { url: 'https://www.mainz.de/aktuelles-erfahren/wahlen/landtagswahlen-2026', publisher: 'Landeshauptstadt Mainz', location: 'Landtagswahl 2026: Wer darf wählen? / Wie wird gewählt?' },
      { url: 'https://www.wahlen.rlp.de/landtagswahl/fuer-wahlberechtigte-und-parteien/wahlsystem', publisher: 'Landeswahlleiter Rheinland-Pfalz', location: 'Wahl zum 19. Landtag 2026: Landesstimme und Wahlkreisstimme' },
    ],
  },
  'saarland/2022': {
    votingAge: 18, voteLabel: 'Stimmen', votesPerVoter: 1, resultColumn: 1,
    sources: [
      { url: 'https://wahlergebnis.saarland.de/LTW/SL_LTW_2022_VE.pdf', publisher: 'Statistisches Amt Saarland', location: 'Landtagswahl 2022, Informationen zur Landtagswahl, PDF-Seite 8: Wahlberechtigung und eine Stimme' },
    ],
  },
  'sachsen/2024': {
    votingAge: 18, voteLabel: 'Zweitstimmen', votesPerVoter: 1, resultColumn: 3,
    sources: [
      { url: 'https://www.landtag.sachsen.de/download/publikationen/Landtagswahl_2024_Broschuere_Leicht_WEB.pdf', publisher: 'Sächsischer Landtag', location: 'Wie wir wählen – Landtags-Wahl 2024, Seite 8: Wer darf wählen?' },
      { url: 'https://wahlen.sachsen.de/download/Presse%20Landtagswahl%202024/LWL-MI-21-2024.pdf', publisher: 'Landeswahlleiter Sachsen', location: 'Medieninformation 21/2024: Listenstimme (Zweitstimme)' },
    ],
  },
  'sachsen-anhalt/2021': {
    votingAge: 18, voteLabel: 'Zweitstimmen', votesPerVoter: 1, resultColumn: 3,
    sources: [
      { url: 'https://statistik.sachsen-anhalt.de/fileadmin/Bibliothek/Landesaemter/StaLa/startseite/Themen/Wahlen/Berichte/6B712_2021-A.pdf', publisher: 'Statistisches Landesamt Sachsen-Anhalt', location: 'Wahl des 8. Landtages 06.06.2021, Seite 6: Vorbemerkungen und Wahlverfahren' },
    ],
  },
  'sachsen-anhalt/2026': {
    votingAge: 18, voteLabel: 'Zweitstimmen', votesPerVoter: 1,
    sources: [
      { url: 'https://wahlen.sachsen-anhalt.de/zu-den-wahlen/landtagswahl/faq-zur-landtagswahl-2026', publisher: 'Landeswahlleiterin Sachsen-Anhalt', location: 'FAQ zur Landtagswahl 2026: Wahlberechtigung und Erst-/Zweitstimme' },
    ],
  },
  'schleswig-holstein/2022': {
    votingAge: 16, voteLabel: 'Zweitstimmen', votesPerVoter: 1, resultColumn: 3,
    sources: [
      { url: 'https://www.schleswig-holstein.de/DE/landesregierung/themen/demokratie-gesellschaft/wahlen/Presse/PI/2022/220428_PI_LT_Wahl.pdf?__blob=publicationFile&v=1', publisher: 'Landeswahlleiter Schleswig-Holstein', location: 'Medien-Information 28.04.2022, PDF-Seiten 1 und 8: Wahlberechtigung und Stimmabgabe' },
    ],
  },
  'thueringen/2024': {
    votingAge: 18, voteLabel: 'Landesstimmen', votesPerVoter: 1, resultColumn: 3,
    sources: [
      { url: 'https://wahlen.thueringen.de/landtagswahlen/informationen/2024/Infoheft_Wahlen_komplett_INET.pdf', publisher: 'Landeswahlleiter Thüringen', location: 'Infoheft zur Landtagswahl 2024: Wahl allgemein / Wahlrecht und Wahlbenachrichtigung' },
    ],
  },
};

export function electionRules(route) {
  if (!Object.hasOwn(rules, route)) throw new Error(`${route}: missing election rules; verify voting age, vote system and source columns first`);
  return rules[route];
}
