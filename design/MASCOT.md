# The election companion

## Direction agreed with the user

Make the site more playful through a companion with a useful role, not by making
the election graphics decorative. The dog watches with you, collects elections,
and may eventually point out connections between them.

### Character

- A mostly white spaniel with long, floppy black ears and a rounded,
  beagle-like muzzle; not a basset's droopy face and not a copy of Snoopy.
- Use a side-facing, articulated standing silhouette with a lively tail and
  expressive head. Separate legs, ears, head, and tail make the running and
  airborne poses readable instead of merely moving a seated icon.
- The first [concept sheet](mascot-concepts.png) ([SVG](mascot-concepts.svg))
  established direction, **not an accepted quality bar**. The user found the
  illustrations lackluster. Do not treat those drawings as finished assets.
- Keep the paper, charcoal, and small red accent. The rest of the interface may
  become more playful; data readability and political neutrality still govern.
- Name and final character artwork remain open.

### Behaviour

1. **Attention:** occasional glances toward meaningful hovered or focused
   controls. Do not continuously follow every pointer movement.
2. **Collection:** adding an election throws a miniature of its actual chart,
   labelled with place/year, toward the dog. The dog runs a few steps toward the
   throw, jumps, catches it at the peak, lands, and returns to rest. The dog is
   also the entry point to the collection.
3. **Discovery, later:** optional, contextual stories about historic elections
   or similarities. Use curated sources, not improvised historical claims.
   Stories must be dismissible and infrequent, not hover-triggered interruptions.

### Catch interaction

- Register the addition immediately. Animation is feedback, never a prerequisite
  for storing the election or opening the collection.
- Anticipation → short run → card arc → airborne catch → landing → settle,
  with the card and muzzle aligned at contact and no long celebration.
- Do not add the same election twice. A collected election can be removed.
- Honour reduced motion; the collection remains equally usable without flight,
  jump, or gaze movement. Keyboard users get the same actions and status feedback.
- Keep the dog and controls out of the chart. On narrow screens use a compact,
  in-flow shelf, not a floating character covering labels or controls.

## First working slice

Build the collection interaction before historical stories or analytical
comparisons:

- One shared companion on home, state, and election pages.
- An add button on election pages; a miniature of the page's chart flies to the dog.
- A collection dialog with election links and individual removal.
- Browser-local persistence of election IDs only. Allowlist IDs against the
  current content collection; never trust stored labels or URLs.
- If storage is blocked, explain that the collection lasts only within current
  in-app navigation. Keep its in-memory state functional.
- Cleanup on Astro navigation so flight effects and event listeners do not leak.
- Revised, articulated vector artwork as a **behaviour prototype**, still subject
  to an illustration-quality review. Do not label it final character art.

The first slice collects elections; it does **not** yet show them side by side.
A future comparison must keep people/votes, denominators, voting rules,
preliminary/final status, and population reference dates explicit. No data or
historical facts should be fabricated to make a demonstration look complete.

## Progress

- [x] Identified spaniel-like reference and agreed character/interaction direction.
- [x] Recorded feedback on the initial artwork and the selected mix of 01 + 03.
- [x] Implement and verify add → catch → collection, including navigation,
      removal, reduced motion, mobile layout, and unavailable storage.
- [ ] Review character quality and interaction with the user.
- [ ] Design the actual comparison view with honest, compatible measures.
- [ ] Research and source the first small set of contextual election stories.

## Implementation and verification

- `src/components/ElectionCompanion.astro`: shared collection shelf, dialog,
  persistence, gaze, chart thumbnail, and cancellable run/jump/catch choreography.
- `src/components/ElectionDog.astro`: articulated standing vector behaviour prototype.
- `src/data/comparison.ts`: allowlisted stored-ID parser.
- `scripts/check-comparison.mjs`: malformed input, duplicates, order, stale IDs,
  and untrusted values. Included in `pnpm test`.
- Generated-page checks cover companion placement and current-election binding.

`pnpm test` passed: collection checks, data validation, Astro types (zero errors
or warnings), production build, all 16 state pages, and 19 election diagrams.
The built production site also passed a collect/persist smoke check with no
browser errors. [Production-build screenshot](companion-prototype.png).

Local Chrome checks exercised actual chart flight, running leg movement, an
airborne catch with the card and muzzle aligned, landing, duplicate prevention,
collection links, year navigation with Astro's client router, reload persistence,
removal and empty state, Escape/focus restoration, keyboard-triggered gaze,
reduced motion, and widths of 320 and 390 pixels without page overflow.
Simulated blocked reads and quota failures kept the collection usable; write
failure also preserved selections across in-app navigation and recovered when
storage became available.

To repeat the core interaction: open an election, choose **Diese Wahl sammeln**,
open **Sammlung**, visit a second election, collect it, reopen the dialog, and
remove entries. Repeat with reduced motion enabled. Storage tests and screenshots
are verification of this prototype, not acceptance of the final illustration.

### Expressive spaniel refinement

The articulated SVG now has a scruffy forelock, scalloped floppy ears, larger
asymmetric eyes with double blinks, muzzle freckles, and a dotted neckerchief.
Hover or keyboard focus on the collection triggers a single play bow and ear
flop. The catch ends with a satisfied head shake; the scarf and tag trail the
jump and overshoot on landing. Idle tail wagging comes in bursts rather than a
uniform pendulum. Offscreen and hidden-tab idle animations pause, and reduced
motion keeps the dog still. No new dependencies or image downloads are needed.
