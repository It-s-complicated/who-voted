---
name: Who voted?
description: Editorial election graphics on warm paper, with precise data colors.
colors:
  primary: "#c8102e"
  ink: "#1c1b1a"
  paper: "#fdfcfa"
  surface: "#fff"
  caption-surface: "#faf8f5"
  text-muted: "#55524d"
  text-secondary: "#6b6760"
  divider: "#c9c5be"
  table-divider: "#e4e1db"
  callout-line: "#8f8b84"
  residents: "#2a3861"
  eligible: "#5b84bb"
  voters: "#7c9dc9"
  valid-votes: "#cad4ed"
  valid-ballots: "#b9cbe9"
  no-valid-vote: "#d8e2f3"
  no-ballot-or-unused-votes: "#e4ecf8"
  not-eligible: "#918e8e"
  non-voters: "#b5b4b4"
  under-age: "#aaa8a8"
  non-german-adults: "#c8c6c7"
  party-cdu: "#202831"
  party-bsw: "#792351"
  party-freie-waehler: "#d88023"
  party-ssw: "#246895"
  party-spd: "#e54040"
  party-gruene: "#30a84b"
  party-linke: "#bd4598"
  party-afd: "#2996cc"
  party-fdp: "#f3d330"
  party-biw: "#005ab0"
  party-fallback: "#76716b"
  party-other: "#b2b2b2"
typography:
  display:
    fontFamily: '"Fraunces Variable", Georgia, serif'
    fontSize: "clamp(2.4rem, 6vw, 4.6rem)"
    fontWeight: 620
    lineHeight: 1.02
    letterSpacing: "-0.015em"
    fontVariation: '"opsz" 14, "SOFT" 0, "WONK" 0'
  body:
    fontFamily: 'ui-sans-serif, system-ui, "Segoe UI", sans-serif'
    fontSize: "1rem"
    fontWeight: 400
  intro:
    fontFamily: 'ui-sans-serif, system-ui, "Segoe UI", sans-serif'
    fontSize: "1.02rem"
    lineHeight: 1.55
  eyebrow:
    fontSize: "0.88rem"
    fontWeight: 550
  control-label:
    fontSize: "0.72rem"
    fontWeight: 650
    letterSpacing: "0.1em"
  table-heading:
    fontSize: "0.72rem"
    fontWeight: 650
    letterSpacing: "0.07em"
  caption:
    fontSize: "0.8rem"
    lineHeight: 1.55
  chart-label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
  chart-value:
    fontSize: "10.5px"
    fontWeight: 400
  footer:
    fontSize: "0.82rem"
    lineHeight: 1.5
  breadcrumb:
    fontSize: "0.88rem"
  timeline-year:
    fontFamily: '"Fraunces Variable", Georgia, serif'
    fontSize: "1.75rem"
    fontWeight: 620
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  index-link:
    fontSize: "1.5rem"
    fontWeight: 600
rounded:
  square: "0px"
spacing:
  section: "1.5rem"
  panel: "1rem"
  inset: "1.1rem"
  header-gap: "2rem"
components:
  year-select:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
    typography: "{typography.control-label}"
    rounded: "{rounded.square}"
    padding: "0.6rem 0.7rem"
    width: "100%"
  figure:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.square}"
  figure-caption:
    backgroundColor: "{colors.caption-surface}"
    textColor: "{colors.text-muted}"
    typography: "{typography.caption}"
    padding: "0.9rem 1.1rem 1rem"
  data-disclosure:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
  disclosure-summary:
    padding: "0.85rem 1.1rem"
  source-link:
    textColor: "{colors.text-muted}"
  source-link-hover:
    textColor: "{colors.primary}"
  chart-menu:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "0.35rem"
  chart-menu-item:
    padding: "0.55rem 0.65rem"
---

# Design System: Who voted?

## Overview

**Creative North Star: "The Election Ledger"**

An editorial, factual, restrained system: expressive serif headlines sit above precise sans-serif data on warm paper. Strong rules frame the content; the visualization supplies the broad areas of color. Pages and controls are flat, square, and restrained.

This records the current shared system in `src/styles/global.css`, the index and election pages, `src/components/ElectionChart.astro`, and the social preview card. Global interface colors are CSS custom properties; chart category colors remain literal values in the election page. The metaphor and color names describe the observed design. Political neutrality remains a binding commitment from `PRODUCT.md`.

**Key Characteristics:**

- Fraunces headlines paired with system sans-serif reading and data text.
- Warm paper, white panels, and dark editorial rules.
- Small red interface accents; semantic color in the chart.
- Native controls, rule-led index pages, and horizontally scrollable data presentation.

## Colors

The interface combines warm neutrals with a restrained red accent; the chart has a separate categorical palette. Frontmatter records the source values.

### Primary

**Civic Red** (`primary`) marks the eyebrow, disclosure marker, link underlines, link hover, and keyboard focus.

### Secondary

The participation series uses `residents`, `eligible`, `voters`, `valid-votes`, `valid-ballots`, `no-valid-vote`, and `no-ballot-or-unused-votes`: navy through pale blue. The neutral chart tokens distinguish ineligibility, non-participation, estimated eligibility groups, and other parties. These mappings carry meaning; their shades are not interchangeable interface accents. Some ballot and unused-vote categories appear only when an election's data requires them.

### Tertiary

The `party-*` tokens record the implemented party mappings. CSU shares CDU's charcoal color; BSW, FREIE WÄHLER, SSW, and BIW have distinct colors. Unknown party names use `party-fallback`; smaller parties grouped as “Sonstige” use `party-other`. These colors identify data categories without signaling endorsement.

### Neutral

**Charcoal Ink** (`ink`) carries main text and strong borders. **Warm Paper** (`paper`) is the page ground; `surface` is white for the figure, disclosure, and select. The warmer `caption-surface` separates methodology from the graphic. Muted and secondary text colors establish reading hierarchy; divider tokens separate status and table rows. `callout-line` connects small chart categories to labels.

**The Data Color Rule.** Preserve category-to-color mappings and keep interface red distinct from the SPD data red.

## Typography

Fraunces Variable, loaded through Astro's Fontsource provider, is the display face, with Georgia and serif fallbacks. Reading text uses the system sans-serif stack. Chart labels use a system sans-serif stack without the explicit Segoe UI entry.

The headline uses the frontmatter's responsive size, variable-font settings, tight leading, and slight negative tracking. Election-page headlines are capped at 15ch with balanced wrapping; introductory text is capped at 40rem. Home-page timeline years form a smaller Fraunces heading level (1.75rem desktop, 1.35rem mobile). The state-list heading uses 1.125rem sans-serif.

Control labels and table headings are uppercase with their respective tracking. The select inherits its label's font. State-page index links use 1.5rem sans-serif at weight 600; home-page election links scale from 1.125rem to 1.5rem. Breadcrumbs use 0.88rem muted text. Status text is 0.8rem; status emphasis, disclosure summaries, and table subtotals use weight 650. Minor-party table rows use 0.92em at weight 400. Chart values and table numbers use tabular numerals; SVG type sizes are in viewBox units and scale with the graphic. Index-page reading text uses 1.55 line-height; the election page inherits the browser default outside its specified reading roles.

## Layout

A centered single column has width `min(100% - 2rem, 66rem)` and vertical padding of 2.5rem above and 4rem below. Election-page headers align their text and year control along the bottom, separated by the header gap. The header's lower rule follows 1.75rem of padding. Status metadata wraps in a flex row with a 0.75rem gap. Index pages share the same column and rule, with linked rows separated by thin dividers; the home page adds a vertical election timeline and a state-link list.

At a maximum viewport width of 42rem, top padding becomes 1.5rem on every page. Election-page gutters shrink to 0.5rem per side and the header becomes a grid. The year control occupies 9rem; its desktop label has an 8rem minimum width. Breadcrumbs and index rows wrap when needed.

The chart fills its panel with a 38rem minimum width inside a horizontal scroll container. Its viewBox is `0 0 720 940`. The table has a separate horizontal scroll container. Preserve these overflow regions so the page itself stays within the viewport. Spacing is contextual, not a strict mathematical scale; frontmatter lists recurring values only.

## Elevation & Depth

Pages have no gradients, blur, or decorative elevation. Warm page and caption surfaces distinguish white content panels. The chart export popover is the one lifted page surface, with a small `0 6px 18px #1c1b1a26` shadow. The generated social preview uses a subtle text shadow to separate its headline from faint chart bands. Header and footer rules are 3px; panel borders and dividers are 1px. Chart flow opacity (0.55) lets overlapping color show through; nodes retain solid fills with white strokes (1.5 SVG units).

## Shapes

Controls, content panels, and the export popover have square corners. Borders are straight and dark; the Sankey ribbons provide the principal curves. The figure clips to its border while its inner chart wrapper scrolls. Native select arrows and disclosure markers remain browser-rendered.

## Components

### Year selector

A visible uppercase label sits 0.4rem above a native select. The control uses a white surface, muted text, a thin ink border, and the frontmatter padding. Options list that state's available election years. No custom disabled, error, or hover treatment is defined.

### Index and breadcrumbs

The home page groups election links by date in descending order, with one compact row per election day instead of reserving space for months without an election. A thin continuous rail and short ticks connect years set in Fraunces to the dated rows; small muted dates sit above prominent state links, and fine dividers separate dates within a year. The year rail narrows at mobile widths while long state names wrap inside the content column. A separate state index follows the timeline. State pages use simple linked rows. Breadcrumbs are a compact, muted text trail separated by slashes; the home link uses a small house icon and has an accessible name. Links retain the shared red underline, hover, and focus treatment.

### Status strip

A compact flex row places a weight-650 result status opposite muted population-date text. A thin neutral rule separates it from the figure; wrapping handles narrow space. It is metadata, without badge or pill styling.

### Sankey figure and caption

The signature graphic flows vertically through horizontal node bars. Layout is generated left-to-right, then transposed for display. Node thickness is 14 SVG units and node padding is 18. Ribbons use the target category color. Category labels sit above bars; party labels rotate 35 degrees beneath the final row. Counts and percentages form a smaller second line. Thin leader lines identify small categories.

Native SVG titles provide value tooltips. The graphic has an accessible title and description; visible chart labels are hidden from the accessibility tree. A bordered, warm caption area below it carries methodology, with a native disclosure for supporting data notes. The chart has no hover animation or selection state.

### Chart export popover

The chart opens a small square popover from its context menu or keyboard context-menu key. It offers SVG and PNG downloads on a white background. The menu uses the only page-surface shadow in the system. Buttons have a transparent resting state and a warm surface on hover or keyboard focus.

### Social preview card

Generated preview images use the same paper, ink, red accent, Fraunces title, and chart-category colors as the site. Faint vertical color bands sit behind the title. The preview is a fixed 1200 × 630 image; its display scale and text shadow are specific to this asset, not page tokens.

### Data disclosure and table

Native `details`/`summary` provides keyboard-operable expansion. The summary has a red marker, pointer cursor, weight 650, and the frontmatter padding. The white panel has a thin ink border. The scrolling table uses collapsed borders, left-aligned row names, right-aligned numeric columns, and tabular numerals. Cell padding is 0.55rem by 0.65rem. Smaller-party labels indent 2rem; subtotals use stronger weight and numeric-cell rules.

### Sources and interaction states

Source links inherit muted footer text with red 1px underlines, offset by 0.18em. Hover turns the text red. All keyboard-focused elements receive a red 2px outline with 2px offset. Interactions use native behavior without authored transitions or animation. The chart-menu buttons are the only authored button pattern; there is no card variant library.

## Playful companion (behaviour prototype)

A side-standing black-and-white spaniel lives on the collection shelf, standing
on the **Sammlung** button. Its single seamless ink outline, flat paper-white
fills, and few bold black markings follow the site's ink-and-paper palette; the
slim collar uses the interface red, not a party colour. When an election joins
the collection, a miniature of the actual chart is thrown on an arc; the dog
runs, jumps, catches it at the top of its jump, carries it home, and tosses it
into the count, which ticks up as the card lands. The shelf keeps the dog out of
the chart, including on mobile, and does not clip it, so the dog may leap just
past the shelf's top edge. A native modal dialog opens the collection; reduced
motion keeps the dog still without changing actions.

This is a more playful direction alongside the editorial data system, not a
redesign of the data marks. Character artwork still awaits the user's review.
See [MASCOT.md](design/MASCOT.md) for the character, rig, choreography, and progress.

## Do's and Don'ts

### Do:

- **Do** reserve Fraunces for display headlines and use sans-serif for reading, controls, and data.
- **Do** preserve semantic chart colors, explicit labels, and the accompanying data table.
- **Do** retain square borders, warm neutral surfaces, and visible keyboard focus.
- **Do** keep wide diagrams and tables inside their own scroll containers.
- **Do** keep the index, breadcrumb, and election pages within the same editorial column and link treatment.

### Don't:

- **Don't** use party colors as interface action or status colors.
- **Don't** replace native disclosure and select behavior with decorative imitations.
- **Don't** treat synthesized preview color ramps as implemented palette tokens.
- **Don't** apply the chart export popover's shadow to ordinary panels.
