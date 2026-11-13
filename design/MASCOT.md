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
  The current character (below) is a fresh drawing, not a refinement of them.
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
- Articulated vector artwork, still subject to the user's illustration review.
  Do not label it final character art.

The first slice collects elections; it does **not** yet show them side by side.
A future comparison must keep people/votes, denominators, voting rules,
preliminary/final status, and population reference dates explicit. No data or
historical facts should be fabricated to make a demonstration look complete.

## Progress

- [x] Identified spaniel-like reference and agreed character/interaction direction.
- [x] Recorded feedback on the initial artwork and the selected mix of 01 + 03.
- [x] Implement and verify add → catch → collection, including navigation,
      removal, reduced motion, mobile layout, and unavailable storage.
- [x] Rebuilt the character and choreography from scratch (see below).
- [ ] Review character quality and interaction with the user.
- [ ] Design the actual comparison view with honest, compatible measures.
- [ ] Research and source the first small set of contextual election stories.

## The current character

### Look

A compact, side-standing spaniel facing the content (left), with a 3/4 head so
both eyes read. Big head, short muzzle, round black bead eyes with two glints,
a small brow, and a closed smile. Markings are few and bold: one long black ear
with a tufted (scalloped) tip, a black hood over the back of the skull, and one
black saddle across the back. The tail is a white feathered plume. A slim collar
in the interface red (not a party colour) carries a round brass tag.

- **One silhouette, no seams.** Body parts are drawn in two passes inside the
  same bones: fat ink strokes first, then borderless fills. Overlapping parts
  merge into a single outline, so knees, shoulders, neck, and tail joints stay
  clean in every pose. Far legs sit in their own darker pass for depth.
- **Restraint.** Paper white, ink, one warm shadow tone for far legs, the red
  collar, a brass tag, and faint blush. No freckles, ticks, or scarf.

### Rig

`src/lib/companion-dog.ts` holds the geometry, the SVG markup, the choreography,
and the rig. Every part is drawn once in the rest pose; bones are groups rotated
about fixed pivots (root, body, head, jaw, and two-segment legs). Ears and tail
are generated ribbons, re-shaped every frame by springs that react to the body's
acceleration: ears stream back while running and float up while airborne, the
tail trails, and a carried card swings. Springs use fixed 4 ms sub-steps, so the
motion is the same at any frame rate.

### Choreography (≈2.7 s)

1. **Notice:** the head snaps up toward the throw, ears perk, a small crouch.
2. **Throw and run:** the card leaves the collect button on a true parabola; the
   dog gallops a few strides toward it (leg phase follows distance travelled, so
   paws do not skate).
3. **Jump and catch:** crouch, take-off, front legs fold, jaws open. The card's
   end point is the dog's computed bite point at the top of its jump, so card
   and mouth meet exactly at every screen size. The jaw snaps shut; eyes squint
   happily.
4. **Land and carry home:** squash on landing, a quick turn on the front paws,
   a proud trot home with the card in its mouth, and a turn back to the reader.
5. **Deliver:** a dip and flick of the head tosses the card into the
   **Sammlung** count. The badge number ticks up only as the card lands, with a
   small burst. (Storage, the button's accessible name, and the announcement
   update immediately on click; if the animation is interrupted the badge
   shows the stored count at once.)

The card is positioned inside the companion element rather than the viewport,
so scrolling during the throw cannot misalign it. The shelf no longer clips its
contents, so the dog may leap a little past the shelf's top edge to make the catch.

### Idle and attention

- Breathing, double blinks, tail-wag bursts, an occasional ear twitch and glance.
- Gaze: on meaningful hover/focus, the eyes shift and the head tilts up or down
  toward the control (never continuous pointer following).
- Hovering or focusing the collect button: the dog crouches, ready for a throw,
  tail going. Hovering or focusing the collection: it offers a paw.
- Idle animations pause when the shelf is offscreen or the tab is hidden; a
  catch in progress is cancelled cleanly.

### Reduced motion

The dog stays completely still (no idle, gaze, greeting, or catch). Collecting
works identically: storage, count, dialog, and the announcement update at once.

## Verification

- `pnpm check`, `pnpm build`, `node scripts/check-comparison.mjs`, and
  `git diff --check` pass.
- Browser checks at 1440×1000 and 390×844 (and 320 px): full sequence with the
  card meeting the mouth at the apex, carry, toss and badge tick; persistence
  across reload; collection dialog; duplicate prevention; keyboard collect;
  reduced motion; offscreen pause and resume; cancellation mid-catch; no page
  errors; no horizontal overflow at rest or during the animation.
