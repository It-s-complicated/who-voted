# The election companion

## Direction agreed with the user

Make the site more playful through a companion with a useful role, not by making
the election graphics decorative. The dog watches with you, collects elections,
and may eventually point out connections between them.

- A mostly white spaniel with long, floppy black ears and a rounded,
  beagle-like muzzle; not a basset's droopy face and not a copy of Snoopy.
- Side-facing and articulated, so running and airborne poses read clearly.
- The first [concept sheet](mascot-concepts.png) ([SVG](mascot-concepts.svg))
  established direction, **not an accepted quality bar**.
- Keep the paper, charcoal, and small red accent. The rest of the interface may
  become more playful; data readability and political neutrality still govern.
- Name and final character approval remain open.

## The character

A chunky, big-headed spaniel pup drawn in `src/components/ElectionDog.astro`
as one inline SVG (`viewBox 0 0 240 151`, ground line at y = 150).

- **Proportions:** the head is almost as large as the body, the legs are short
  and end in rounded paws, and the plume tail curls up. The body is side-on;
  the head is turned three-quarters towards the reader, so both eyes show.
- **Markings:** warm-white fur (`#fffaf1`, `#ece2d3` for far legs), charcoal
  ears, a crown patch, a saddle and a tail tip. The patches are clipped to the
  body outlines, so the edges stay clean and a single 2.4-unit ink outline
  goes over the top.
- **Face:** big glossy eyes with two highlights, short brows, a dark nose with
  a sheen, three muzzle freckles, a soft blush, and a small panting tongue.
- **Accent:** a red collar (interface `--primary`, not a party colour) with a
  paper tag carrying a red tick, the "collected" mark.
- **Basket:** a wicker basket beside the dog holds up to three blank paper
  cards, one per collected election. It shows the collection size without
  motion, so it also works with reduced motion. The cards carry neutral grey
  lines only, no data or party colours.

The shelf is the dog's stage. The "Sammlung" pill is the ledge the paws and
basket stand on, and the dog's column sits above the invitation text so it runs
in front of it, not underneath. Nothing overlaps the chart.

## Behaviour

1. **Idle:** breathing, single blinks, an ear twitch, a sniff with a nose
   wiggle, a lazy tail with occasional wag bursts, a swinging tag, and panting.
   Periods are deliberately unequal (3.6 s to 11.2 s), so the loop never looks
   mechanical. Idle animation pauses offscreen and in hidden tabs.
2. **Attention:** short glances (eyes and a few degrees of head tilt) towards
   meaningful hovered or focused controls and the chart. It does not track
   every pointer movement.
3. **Greeting:** hover or keyboard focus on the collection makes the dog look
   up, perk its ear, wag hard, and offer a paw with a little wave.
4. **Collection:** see the catch choreography below. The dog is also the
   entry point to the collection dialog.
5. **Discovery, later:** optional, contextual stories about historic elections
   or similarities. Use curated sources, not improvised historical claims.
   Stories must be dismissible and infrequent, not hover-triggered interruptions.

### Catch choreography (2.8 s)

| ms | Beat |
| --- | --- |
| 0–260 | Anticipation: crouch, eyes and nose go up to the thrown card |
| 260–700 | Two gallop strides towards the throw |
| 700–1100 | Crouch, take-off with the nose up, mouth opens, **catch at the peak** |
| 1100–1480 | Fall, squash on landing, ears and tag overshoot |
| 1520–1660 | Spin-hop turn while still holding the card |
| 1660–2160 | Trot home on diagonal leg pairs |
| 2160–2440 | Dip the head and drop the card into the basket, which bounces |
| 2440–2800 | Turn back with a hop, happy squint, settle |

- The addition is registered before any animation. Animation is feedback,
  never a prerequisite for storing the election or opening the collection.
- The thrown card is **one object for the whole trip**: a miniature of the
  page's actual chart, labelled with year and place. Each frame, it is placed
  from the head's live screen matrix (`getScreenCTM`). It meets the muzzle
  exactly at the catch, stays in the mouth through the landing and turn, and
  then drops into the basket. The new basket card appears only on that drop.
- All parts run on one shared clock (`startTime` set on every animation). The
  card reads the master animation's `currentTime`, so it can never drift from
  the dog. Every moving part pivots around a fixed point in the drawing
  (`transform-box: view-box`), not around a changing bounding box.
- Do not add the same election twice. A collected election can be removed.
- Reduced motion: no idle animation, gaze, greeting, flight, jump, or turn. The
  count, announcement, storage, and basket still update immediately.
- Navigating away, scrolling the shelf offscreen, or hiding the tab cancels the
  catch cleanly.

## First working slice

- One shared companion on home, state, and election pages.
- An add button on election pages; a miniature of the page's chart flies to the dog.
- A collection dialog with election links and individual removal.
- Browser-local persistence of election IDs only. Allowlist IDs against the
  current content collection; never trust stored labels or URLs.
- If storage is blocked, explain that the collection lasts only within current
  in-app navigation. Keep its in-memory state functional.
- Cleanup on Astro navigation, so flight effects and event listeners do not leak.

The first slice collects elections; it does **not** yet show them side by side.
A future comparison must keep people/votes, denominators, voting rules,
preliminary/final status, and population reference dates explicit. No data or
historical facts should be fabricated to make a demonstration look complete.

## Progress

- [x] Identified spaniel-like reference and agreed character/interaction direction.
- [x] Implement and verify add → catch → collection, including navigation,
      removal, reduced motion, mobile layout, and unavailable storage.
- [x] Redraw the character from scratch and rebuild the choreography around a
      carried card and a collection basket.
- [ ] Review character quality and interaction with the user.
- [ ] Design the actual comparison view with honest, compatible measures.
- [ ] Research and source the first small set of contextual election stories.

## Implementation and verification

- `src/components/ElectionDog.astro`: artwork, pivots, idle loop, greeting,
  reduced-motion rules.
- `src/components/ElectionCompanion.astro`: shelf, dialog, persistence, gaze,
  basket stack, chart thumbnail, and the cancellable catch choreography.
- `src/data/comparison.ts`: allowlisted stored-ID parser.
- `scripts/check-comparison.mjs`: malformed input, duplicates, order, stale IDs,
  and untrusted values. Included in `pnpm test`.
- Captures: [desktop](pr-assets/election-companion-playful-desktop.png),
  [mobile](pr-assets/election-companion-playful-mobile.png),
  [GIF](pr-assets/election-companion-playful.gif) and
  [MP4](pr-assets/election-companion-playful.mp4) of greeting → throw → catch → basket.

To repeat the core interaction: open an election, choose **Diese Wahl sammeln**,
watch the card land in the basket, open **Sammlung**, visit a second election,
collect it, reopen the dialog, and remove entries. Repeat with reduced motion
enabled. Verify that no horizontal overflow appears at 390 pixels.
