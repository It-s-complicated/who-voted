# Restyling: Sankey-led editorial baseline

Status: **agreed starting point, implemented as a development-only preview.** This is not a finished design or a production cutover. Keep this direction as the baseline for subsequent refinement rather than restarting the visual exploration.

The earlier **Civic Data Atlas** proposal is superseded where it conflicts with the decisions below. In particular, replacing Fraunces with Inter and moving a state grid ahead of the timeline are not the current direction.

## Direction

Give **Wer hat gewählt?** character through the visual language of its own Sankey charts: broad, gently bending flows on warm paper, expressive serif headlines, and a clear election timeline.

The page should remain an approachable, politically neutral explanation of election participation in the context of the whole resident population. Decorative artwork establishes identity; the actual election chart remains the authoritative data visualization. The two must not be confused.

## Locked in for now

- Keep the large serif headline, warm beige canvas, and general layout established in the preview.
- Start the background chart across the **full content width**, with **three broad ribbons** beneath its initial bar.
- Give the background a clear **top-to-bottom Sankey structure**, with ribbons splitting and meeting at horizontal bars.
- Use **gentle bends and local overlaps between neighboring flows**. Avoid both ruler-straight columns and long ribbons sweeping from one side of the page to the other.
- Use **solid, toned-down pastel colors**, not shading or glossy treatments.
- Keep a **soft beige clearing behind the heading** so the artwork is quieter there. Text itself stays opaque and sharp.
- Fade the artwork down into a calm content area.
- Keep the **full year-and-date timeline**, including elections on the same date, rather than reducing it to a recent-election list.
- Do not add decorative eyebrow text or filler slogans.

These decisions establish the direction, not final dimensions, perfect ribbon shapes, or production-ready responsive behavior. There is still substantial refinement to do.

## Visual system

### Typography

- Retain Fraunces for expressive display headlines and timeline years.
- Keep sans-serif text for reading, controls, dates, and data labels.
- Use tabular numbers for statistics, dates, and table values.
- Do not add decorative uppercase eyebrows above headings. Meaningful election metadata is not decoration and must remain available.
- Keep actual chart labels readable and distinct from secondary counts and percentages.

### Color and surfaces

Use warm beige paper (`#f8f5ee` in the preview), dark ink, quiet dividers, and a restrained pastel illustration palette:

| Background color | Preview value |
| --- | --- |
| Blue | `#b3c2cd` |
| Clay | `#d6b9a9` |
| Sage | `#bbc6b0` |
| Sand | `#dfcda9` |

These are **illustration colors, not replacements for data-category or party colors**. Preserve the existing semantic colors in actual election charts. Do not use warning colors to characterize people who did not vote or were not eligible.

Keep surfaces flat and avoid a dashboard of cards, heavy shadows, decorative maps, or glossy/3D effects. The soft heading clearing and downward fade may use gradients; the ribbons themselves use solid fills. The temporary tuning panel is a development tool, not a production component pattern.

Visible keyboard focus and sufficient contrast remain requirements. The preview's clearing is a starting mechanism for legibility, not evidence that a final contrast audit has been completed.

### Background chart and heading clearing

Use **TanStack Charts to generate the Sankey layout and graphic**, rather than manually drawing ribbon paths or positioning every bar and port.

The current implementation uses `sankeyDiagram`, filled `areaX` marks, and `rect` marks. It transposes the layout for top-to-bottom flow. A small alternating horizontal offset moves each generated layer and its ribbon endpoints together, producing gentle bends without detaching flows from their bars. Keep flow widths conserved.

- Ribbons should remain broad, including when they split.
- Exchanges stay between neighboring flows; do not reintroduce arbitrary full-width crossings.
- The full-width initial bar feeds three ribbons; it is not a measured population breakdown.
- The background is illustrative and must not acquire labels, percentages, or other cues suggesting real election data.
- The beige clearing is a soft, locally quieter spot behind the heading, not a visible card, frosted-glass panel, or blur applied to the text.
- Fade the artwork itself. Keep the headline, links, and content opaque.
- Keep the actual election Sankey and its labels on a calm reading surface when adapting this direction to election pages.

## Homepage

Retain the preview's generous heading area followed by the **complete chronological timeline**. Large years, a continuous rail, date ticks, and grouped state links provide the starting structure for further refinement. Keep the **Nach Bundesland** index available below the timeline.

Do not replace the timeline with only the latest elections or move a state-first grid above it based on the earlier proposal. A more expressive treatment of the timeline can be explored later, without losing its chronological navigation or link coverage.

## Interactive preview

Run `pnpm dev`, then open:

[Current redesign preview](http://localhost:4321/design-preview/printed/)

The **Adjust graphic** panel at the bottom right updates the preview live. It provides node spacing, bar height, ribbon bend, neighboring-flow width, graphic height, fade start/end, heading-clearing strength/size, and four color pickers. **Reset defaults** restores the baseline.

The global crossing-layout toggle was removed: the graph now keeps exchanges local. Tuning is temporary and **resets on reload**; there is no saved-preset or sharing system. The route is development-only, marked `noindex`, and excluded from the production build.

### Baseline defaults

These values record the current checkpoint. `defaultSettings` in `src/components/preview-sankey.ts` is the executable source; update this table deliberately if the baseline is changed. Percentages here are illustration/control settings, not election statistics.

| Control | Default |
| --- | --- |
| Node spacing | 48 px |
| Bar height | 16 px |
| Ribbon bend | 96 px |
| Neighbor-flow width | 16 % |
| Graphic height | 820 px |
| Fade start | 42 % |
| Fade end | 100 % |
| Heading clearing | 100 % |
| Clearing size | 100 % |

Heading clearing at 100% means full strength of the **soft clearing layer**, not a solid rectangular cover or a change to text opacity. Clearing size is relative to the preview's base gradient size.

### Implementation references

- `src/pages/design-preview/[concept].astro`: development-only route, headline, clearing, timeline, and state index.
- `src/components/PreviewSankey.astro`: rendered artwork and live tuning controls.
- `src/components/preview-sankey.ts`: illustrative graph, TanStack rendering, palette, control bounds, and defaults.
- `scripts/check-preview-sankey.mjs`: geometry, three starting ribbons, local bends, control extremes, and validation checks.

For preview changes, use the targeted self-check and the existing application checks:

```sh
node scripts/check-preview-sankey.mjs
pnpm check
pnpm build
node scripts/check-diagram.mjs
```

Also verify the actual desktop/mobile composition, keyboard-operated controls, live updates, reset behavior, and exclusion of preview routes from production output. Automated geometry checks do not replace visual judgment.

## Election pages: follow-up, not yet approved or implemented

The accepted baseline is currently a homepage preview. The actual election pages, state indexes, and production homepage have not been restyled.

Earlier ideas such as a compact state/year selector, a resident-based participation summary, and reading notes beside the chart remain possible follow-up work, not approved implementation requirements. If a summary is introduced, distinguish resident-based shares from the official turnout rate among eligible voters and display the denominator explicitly.

Before a cutover, decide how much decorative artwork belongs on an election page without delaying or competing with the actual data chart. Preserve meaningful election metadata, methodology, and access to official sources.

## Mobile and remaining work

- Refine the artwork's crop, bends, heading clearing, and transition into the timeline at mobile and intermediate widths.
- Revisit header height and spacing without making the actual chart harder to reach.
- Check text contrast, keyboard focus, long state names, and the full timeline's readability.
- Keep the actual chart and data table in their own overflow regions. Do not shrink the entire chart until its labels become unreadable.
- Make horizontal chart scrolling discoverable and keep reading notes accessible.
- Adapt the agreed direction to production pages only when that work is requested; the preview is not a completed redesign.

## Rejected or superseded directions

- Free-form decorative ribbons that lack recognizable Sankey bars and flow structure.
- Hand-authored ribbon geometry instead of a chart-generated layout.
- Shaded, glossy, or sculptural bands, including the earlier second preview variant.
- The earlier translucent treatment as a separate visual direction; prefer toned-down solid colors rather than relying on transparency to soften saturated colors.
- Thin ribbons, straight vertical runs, and long side-to-side sweeps.
- Decorative eyebrow text and filler slogans.
- Replacing the full timeline with a short recent-election list.

The fade and heading clearing are intentional uses of transparency; they are not rejected by the preference for solid ribbon colors.

## Invariants and non-goals

- Preserve political neutrality and ordinary-language explanations.
- Distinguish ineligibility from eligible non-participation.
- Preserve the actual Sankey's data, proportions, party colors, and election-specific rules.
- Keep counts traceable to official sources and denominators explicit.
- Keep population reference dates and final/provisional result status visible. Preserve explanations of estimates, population/register differences, invalid versus uncast votes, and party grouping.
- Do not add a comparison dashboard, decorative map, new data pipeline, or new data interaction model as part of this visual work. Preview tuning controls are not a production feature commitment.
- This document records the redesign baseline. Existing production styles in `src/styles/global.css` and the election pages remain unchanged until a cutover is implemented.

Use code-first changes and bounded verification. Do not start Impeccable live mode unless explicitly requested.

## Earlier proposal (superseded)

The earlier Civic Data Atlas exploration used a sans-serif, state-first composition and a static Berlin 2023 concept. It is historical context, not the accepted baseline, and does not demonstrate the current preview, live controls, or mobile behavior. Use the development preview and the decisions above as the starting point for further work.
