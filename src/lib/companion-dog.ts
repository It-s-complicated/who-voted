/**
 * The election companion dog: geometry, markup, and catch choreography.
 *
 * The dog is drawn once in a rest pose (facing left, paws on GROUND) and moved
 * by "bones": SVG groups rotated about fixed pivots. Every body part shares the
 * same drawing coordinates, so a pose is just a set of angles and offsets.
 *
 * Outlines come from a two-pass layer (fat ink strokes, then borderless fills)
 * so overlapping parts merge into one clean silhouette without seams at the
 * joints. Ears and tail are generated ribbons whose shape follows springs.
 */

export const GROUND = 140;
/** Visible drawing area; the SVG overflows it while running and jumping. */
export const VIEWBOX = { x: 22, y: 16, width: 176, height: 130 } as const;

type Point = readonly [number, number];

export const PIVOT = {
  /** Turns pivot near the front paws, so the head stays inside the shelf when facing home. */
  root: [112, GROUND],
  shadow: [126, GROUND],
  body: [124, 100],
  head: [92, 72],
  jaw: [64, 64],
  frontNear: [101, 96], frontNearKnee: [100, 119],
  frontFar: [112, 96], frontFarKnee: [111, 119],
  hindNear: [149, 98], hindNearKnee: [153, 121],
  hindFar: [140, 98], hindFarKnee: [144, 121],
  earNear: [83, 38], earFar: [62, 31], tail: [162, 82],
  /** Between the front teeth: where the card is caught and carried. */
  bite: [40, 68],
} as const satisfies Record<string, Point>;

/* ------------------------------------------------------------------ shapes */

const SHAPES = {
  torso: "M90 84 C103 74 139 72 158 78 C171 82 175 99 165 108 C153 116 126 113 109 111 C96 110 86 103 86 93 C86 89 87 86 90 84 Z",
  neck: "M91 97 C85 89 82 77 84 64 L96 63 C99 70 104 75 112 77 L106 94 Z",
  skull: "M72 25 C88 24 100 36 100 51 C100 66 89 76 74 76 C59 76 47 65 47 50 C47 36 57 26 72 25 Z",
  muzzle: "M62 49 C54 45 41 44 34 49 C28 54 29 64 37 67 C45 70 58 69 66 64 Z",
  jaw: "M65 61 C58 66 48 70 41 69 C37 69 36 73 40 75 C47 78 60 76 68 70 Z",
  mouth: "M38 66 C48 68 58 66 66 61 L67 71 C58 76 46 77 40 73 Z",
  tongue: "M43 70 C47 66 55 66 58 69 C56 73 49 74 43 70 Z",
  frontNearUpper: "M94 92 C94 86 108 86 108 92 L106 120 C105 124 95 124 95 120 Z",
  frontNearLower: "M95 117 L105 117 L104 133 C104 135 103 136 102 137 L88 137 C85 137 84 134 86 132 C88 131 92 131 95 131 Z",
  frontFarUpper: "M105 92 C105 86 119 86 119 92 L117 120 C116 124 106 124 106 120 Z",
  frontFarLower: "M106 117 L116 117 L115 133 C115 135 114 136 113 137 L99 137 C96 137 95 134 97 132 C99 131 103 131 106 131 Z",
  hindNearUpper: "M138 90 C146 80 166 84 165 99 C164 110 160 118 158 123 C154 126 148 125 147 121 C143 112 134 98 138 90 Z",
  hindNearLower: "M148 117 L158 118 L157 133 C157 135 156 136 155 137 L143 137 C140 137 139 134 141 132 C143 131 146 131 148 131 Z",
  hindFarUpper: "M129 90 C137 80 157 84 156 99 C155 110 151 118 149 123 C145 126 139 125 138 121 C134 112 125 98 129 90 Z",
  hindFarLower: "M139 117 L149 118 L148 133 C148 135 147 136 146 137 L134 137 C131 137 130 134 132 132 C134 131 137 131 139 131 Z",
} as const;

const DETAILS = {
  saddle: "M114 70 C128 77 146 79 158 76 C170 76 178 88 174 104 C164 102 152 96 144 95 C134 94 124 90 118 82 Z",
  cap: "M76 20 C90 20 104 34 102 50 C96 46 89 43 84 43 C80 38 75 31 70 25 Z",
  collar: "M82 74 C90 79 100 80 107 78 L109 85 C101 88 90 87 81 82 Z",
  collarHighlight: "M85 77 C91 80 99 81 105 80",
  tagRing: "M95 85 L95 88",
  nose: "M30 51 C33 47 40 47 42 51 C43 55 40 58 36 58 C32 58 29 55 30 51 Z",
  noseGlint: "M33 51 C34 50 36 50 37 50",
  smile: "M37 65 C40 67 44 68 47 67 M47 67 C52 67 56 65 59 62",
  happyEyes: "M60 47 C62 42 69 42 71 47 M43 48 C44 44 49 44 50 48",
  browNear: "M60 34 C63 32 68 32 71 34",
  browFar: "M44 37 C46 35 49 35 51 36",
  chestFluff: "M95 101 C97 104 100 105 103 104 M91 96 C92 99 94 100 97 100",
  toesFront: "M90 134 L90 137 M94 134 L94 137",
} as const;

/* ---------------------------------------------------------- ribbon parts */

function chain(base: Point, angle: number, segments: ReadonlyArray<readonly [number, number]>): Point[] {
  const points: Point[] = [base];
  let [x, y] = base;
  let heading = angle;
  for (const [length, bend] of segments) {
    heading += bend;
    x += length * Math.cos(heading * Math.PI / 180);
    y += length * Math.sin(heading * Math.PI / 180);
    points.push([x, y]);
  }
  return points;
}

const fmt = (value: number) => (Math.round(value * 10) / 10).toString();

function smooth(points: Point[]): string {
  let d = "";
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${fmt(c1[0])} ${fmt(c1[1])} ${fmt(c2[0])} ${fmt(c2[1])} ${fmt(p2[0])} ${fmt(p2[1])}`;
  }
  return d;
}

/** A soft, tapered strip around a spine, rounded (or scalloped) at the tip. */
function ribbon(spine: Point[], widths: readonly number[], scallops = 0): string {
  const left: Point[] = [];
  const right: Point[] = [];
  spine.forEach((point, i) => {
    const previous = spine[Math.max(0, i - 1)];
    const next = spine[Math.min(spine.length - 1, i + 1)];
    const length = Math.hypot(next[0] - previous[0], next[1] - previous[1]) || 1;
    const nx = -(next[1] - previous[1]) / length;
    const ny = (next[0] - previous[0]) / length;
    const half = widths[i] / 2;
    left.push([point[0] + nx * half, point[1] + ny * half]);
    right.push([point[0] - nx * half, point[1] - ny * half]);
  });
  const cap = (from: Point, to: Point, along: Point, reach: number, bumps = 0) => {
    const c1 = [from[0] + along[0] * reach, from[1] + along[1] * reach];
    const c2 = [to[0] + along[0] * reach, to[1] + along[1] * reach];
    if (!bumps) return ` C${fmt(c1[0])} ${fmt(c1[1])} ${fmt(c2[0])} ${fmt(c2[1])} ${fmt(to[0])} ${fmt(to[1])}`;
    // Split the rounded cap into soft tufts of fur.
    const at = (t: number): Point => {
      const u = 1 - t;
      return [
        u * u * u * from[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * to[0],
        u * u * u * from[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * to[1],
      ];
    };
    let d = "";
    for (let k = 0; k < bumps; k++) {
      const a = at(k / bumps);
      const b = at((k + 1) / bumps);
      const mid = at((k + .5) / bumps);
      const bulge = reach * .32;
      const out: Point = [mid[0] + along[0] * bulge, mid[1] + along[1] * bulge];
      const control: Point = [2 * out[0] - (a[0] + b[0]) / 2, 2 * out[1] - (a[1] + b[1]) / 2];
      d += ` Q${fmt(control[0])} ${fmt(control[1])} ${fmt(b[0])} ${fmt(b[1])}`;
    }
    return d;
  };
  const direction = (a: Point, b: Point): Point => {
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [(b[0] - a[0]) / length, (b[1] - a[1]) / length];
  };
  const last = spine.length - 1;
  const tipWidth = widths[last];
  const baseWidth = widths[0];
  const reversedRight = [...right].reverse();
  return `M${fmt(left[0][0])} ${fmt(left[0][1])}${smooth(left)}`
    + cap(left[last], right[last], direction(spine[last - 1], spine[last]), tipWidth * .7, scallops)
    + smooth(reversedRight).replace(/^ /, " ")
    + cap(right[0], left[0], direction(spine[1], spine[0]), baseWidth * .6)
    + " Z";
}

export interface Secondary {
  /** Ear swing in degrees; negative swings the tips backward. */
  earSwing: number;
  /** 0 hanging, 1 weightless: ears float up while airborne. */
  earLift: number;
  /** Tail angle offset in degrees; negative lifts the plume forward. */
  tail: number;
}

export const REST_SECONDARY: Secondary = { earSwing: 0, earLift: 0, tail: 0 };

export function earNearPath({ earSwing, earLift }: Secondary): string {
  const angle = 84 - earLift * 52 + earSwing;
  const curl = 7 - earLift * 9 + earSwing * .25;
  return ribbon(chain(PIVOT.earNear, angle, [[10, 0], [11, curl], [11, curl], [9, curl * .8]]), [9, 14, 17, 17, 14], 3);
}

export function earFarPath({ earSwing, earLift }: Secondary): string {
  const angle = 104 - earLift * 80 + earSwing * .8;
  const curl = 4 - earLift * 8 + earSwing * .2;
  return ribbon(chain(PIVOT.earFar, angle, [[8, 0], [9, curl], [9, curl * .8], [7, curl * .5]]), [8, 11, 13, 13, 10], 2);
}

export function tailPath({ tail }: Secondary): string {
  const curl = -18 + tail * .3;
  return ribbon(chain(PIVOT.tail, -48 + tail, [[7, 0], [8, curl * .5], [9, curl], [9, curl * 1.3]]), [8, 11, 13, 11, 5], 2);
}

/* ---------------------------------------------------------------- markup */

const ID = "companion-dog";
const use = (name: string, extra = "") => `<use href="#${ID}-${name}"${extra}/>`;
const path = (d: string, cls: string) => `<path class="${cls}" d="${d}"/>`;

function leg(name: "frontNear" | "frontFar" | "hindNear" | "hindFar") {
  return `<g data-bone="${name}"><g class="idle-${name}">${use(`${name}Upper`)}`
    + `<g data-bone="${name}Knee"><g class="idle-${name}Knee">${use(`${name}Lower`)}</g></g></g></g>`;
}

function head(content: string) {
  return `<g data-bone="head"><g class="idle-head">${content}</g></g>`;
}

const jaw = (content: string) => `<g data-bone="jaw">${content}</g>`;

/** Inner markup of the companion SVG, rendered at rest. */
export function dogMarkup(): string {
  const shapes = Object.entries(SHAPES).map(([name, d]) => `<path id="${ID}-${name}" d="${d}"/>`).join("");
  const silhouette = (pass: string) => `<g class="pass ${pass}">`
    + `<g class="idle-tail">${use("tail")}</g>`
    + leg("hindNear")
    + use("torso") + use("neck")
    + leg("frontNear")
    + head(use("skull") + `<g class="mouth-inside">${use("mouth")}${jaw(use("tongue"))}</g>` + use("muzzle") + jaw(use("jaw")))
    + `</g>`;
  const far = (pass: string) => `<g class="pass ${pass} far">${leg("hindFar")}${leg("frontFar")}</g>`;
  return `<defs>${shapes}`
    + `<path id="${ID}-tail" d="${tailPath(REST_SECONDARY)}"/>`
    + `<path id="${ID}-earNear" d="${earNearPath(REST_SECONDARY)}"/>`
    + `<path id="${ID}-earFar" d="${earFarPath(REST_SECONDARY)}"/>`
    + `<clipPath id="${ID}-clip-torso">${use("torso")}${use("neck")}</clipPath>`
    + `<clipPath id="${ID}-clip-skull">${use("skull")}</clipPath>`
    + `</defs>`
    + `<ellipse class="dog-shadow" data-shadow cx="${PIVOT.shadow[0]}" cy="${GROUND + .5}" rx="46" ry="4.5"/>`
    + `<g data-bone="root"><g class="idle-root"><g data-bone="body">`
    + far("outline") + far("fill")
    + head(`<g class="ear far-ear">${use("earFar")}</g>`)
    + silhouette("outline") + silhouette("fill")
    + `<g class="details">`
    + `<g clip-path="url(#${ID}-clip-torso)">${path(DETAILS.saddle, "patch")}</g>`
    + path(DETAILS.chestFluff, "fur-line")
    + `<g class="toes">${path(DETAILS.toesFront, "fur-line")}</g>`
    + path(DETAILS.collar, "collar") + path(DETAILS.collarHighlight, "collar-highlight")
    + `<g class="dog-tag"><path class="tag-ring" d="${DETAILS.tagRing}"/><circle class="tag" cx="95" cy="91" r="4"/></g>`
    + head(
      `<g clip-path="url(#${ID}-clip-skull)">${path(DETAILS.cap, "patch")}</g>`
      + `<g class="dog-eyes"><g class="eyes-open">`
      + `<ellipse class="eye" cx="65.5" cy="47" rx="4.6" ry="5.8"/><ellipse class="eye" cx="46.5" cy="48" rx="3.3" ry="4.6"/>`
      + `<circle class="glint" cx="67" cy="44.6" r="1.8"/><circle class="glint" cx="47.6" cy="46" r="1.2"/>`
      + `<circle class="glint glint-small" cx="63.8" cy="49.6" r=".8"/>`
      + `</g>${path(DETAILS.happyEyes, "eyes-happy")}</g>`
      + `<g class="brows">${path(DETAILS.browNear, "brow")}${path(DETAILS.browFar, "brow")}</g>`
      + `<ellipse class="blush" cx="70" cy="60" rx="5.5" ry="3"/>`
      + path(DETAILS.smile, "smile")
      + path(DETAILS.nose, "nose") + path(DETAILS.noseGlint, "nose-glint")
      + `<g class="idle-ear">${use("earNear", ' class="ear near-ear"')}</g>`
      + `<circle class="bite" data-bite cx="${PIVOT.bite[0]}" cy="${PIVOT.bite[1]}" r=".6"/>`
    )
    + `</g></g></g></g>`;
}

/* ----------------------------------------------------------- choreography */

/** Milliseconds from the click. The card is thrown, caught, carried home and tossed into the collection. */
export const TIMING = {
  launch: 90,
  catch: 910,
  release: 2010,
  pop: 2330,
  end: 2720,
} as const;

type Ease = (u: number) => number;
const linear: Ease = (u) => u;
const inOut: Ease = (u) => u < .5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2;
const out: Ease = (u) => 1 - (1 - u) ** 3;
const easeIn: Ease = (u) => u * u * u;
const sine: Ease = (u) => (1 - Math.cos(Math.PI * u)) / 2;
type Key = readonly [time: number, value: number, ease?: Ease];

function track(...keys: Key[]) {
  return (t: number) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [end, value, ease = inOut] = keys[i];
      if (t <= end) {
        const [start, from] = keys[i - 1];
        return from + (value - from) * ease((t - start) / (end - start));
      }
    }
    return keys[keys.length - 1][1];
  };
}

const window01 = (t: number, start: number, end: number) => Math.min(1, Math.max(0, (t - start) / (end - start)));

const RUN = 30;
const JUMP = 25;
const AIR = { takeoff: 690, land: 1130 } as const;
const TURN_OUT = [1240, 1390] as const;
const TROT = [1390, 1770] as const;
const TURN_HOME = [1770, 1910] as const;

const xTrack = track(
  [200, 0], [600, -RUN, easeIn], [AIR.takeoff, -RUN - 4, out],
  [AIR.land, -RUN - 16, linear], [AIR.land + 110, -RUN - 18, out],
  [TROT[0], -RUN - 18], [TROT[1], 0, sine],
);
const squashTrack = track(
  [40, 1], [190, .92, out], [250, 1.04], [320, 1],
  [600, 1], [AIR.takeoff - 10, .87, out], [AIR.takeoff + 40, 1.07, out], [820, 1],
  [AIR.land, 1], [AIR.land + 40, .88, out], [AIR.land + 110, 1.04], [AIR.land + 170, 1],
  [TURN_OUT[0] + 20, .94], [TURN_OUT[0] + 80, 1.03], [TURN_OUT[1], .96], [TURN_OUT[1] + 50, 1],
  [TURN_HOME[0] + 20, .95], [TURN_HOME[0] + 80, 1.03], [TURN_HOME[1], .97], [TURN_HOME[1] + 40, 1],
  [1990, .95], [2080, 1.03], [2200, 1], [TIMING.pop + 20, .95], [TIMING.pop + 120, 1.03], [TIMING.pop + 230, 1],
);
const pitchTrack = track(
  [0, 0], [180, 4, out], [260, -3], [600, -4],
  [AIR.takeoff - 10, -7], [AIR.takeoff + 70, 11, out], [TIMING.catch, 5], [AIR.land - 40, -9], [AIR.land + 50, -4], [TURN_OUT[0], 0],
  [1900, 0], [1990, -7], [2060, 5, out], [2240, 0],
);
const headTrack = track(
  [0, 0], [150, 20, out], [260, 13], [600, 14],
  [AIR.takeoff, 20], [TIMING.catch - 80, 27], [TIMING.catch, 22], [TIMING.catch + 70, 6, out],
  [AIR.land + 30, -8], [AIR.land + 120, 6], [TROT[0], 9], [TROT[1], 8],
  [1910, 2], [1995, -15, out], [2045, 16, out], [2200, 10], [TIMING.pop + 40, 14], [TIMING.pop + 260, 0],
);
const jawTrack = track(
  [0, 0], [AIR.takeoff - 40, 0], [TIMING.catch - 120, -26, out], [TIMING.catch - 10, -27],
  [TIMING.catch + 35, -3, out], [TIMING.release - 15, -3], [TIMING.release + 40, -22, out], [2200, -12],
  [TIMING.pop + 60, -20], [TIMING.pop + 280, -8], [TIMING.end, 0],
);
const gallop = track([200, 0], [280, 1], [560, 1], [AIR.takeoff - 30, 0]);
const trot = track([TROT[0] - 20, 0], [TROT[0] + 50, 1], [TROT[1] - 70, 1], [TROT[1] + 20, 0]);
const wagAmount = track([0, 4], [160, 20], [600, 8], [AIR.land, 4], [TROT[0], 18], [TROT[1], 14], [TIMING.pop, 26], [TIMING.end, 8]);
const tailLift = track([0, 0], [160, -12], [260, 10], [600, 20], [AIR.land, 28], [AIR.land + 120, 0], [TROT[0], -8], [TIMING.pop, -12], [TIMING.end, 0]);

/* Leg keyframes: [near upper, near knee, far upper, far knee] for front and hind. */
const legKeys = (values: ReadonlyArray<readonly [number, ...number[]]>) =>
  [0, 1, 2, 3].map((index) => track(...values.map(([time, ...angles]) => [time, angles[index]] as Key)));
const frontLegs = legKeys([
  [0, 0, 0, 0, 0], [190, 10, -14, 8, -12], [300, 0, 0, 0, 0],
  [600, 0, 0, 0, 0], [AIR.takeoff - 10, 16, -28, 14, -26], [AIR.takeoff + 80, 44, -96, 38, -88],
  [TIMING.catch, 52, -104, 46, -98], [AIR.land - 60, 30, -6, 24, -10], [AIR.land + 40, 10, -22, 8, -20], [AIR.land + 150, 0, 0, 0, 0],
  [TURN_OUT[0] + 70, 18, -36, 14, -30], [TURN_OUT[1], 0, 0, 0, 0],
  [TURN_HOME[0] + 70, 18, -36, 14, -30], [TURN_HOME[1], 0, 0, 0, 0],
  [1995, 14, -26, 12, -22], [2120, 0, 0, 0, 0],
]);
const hindLegs = legKeys([
  [0, 0, 0, 0, 0], [190, -8, 14, -6, 12], [300, 0, 0, 0, 0],
  [600, 0, 0, 0, 0], [AIR.takeoff - 10, -16, 28, -14, 26], [AIR.takeoff + 80, -48, 12, -42, 14],
  [TIMING.catch, 22, 46, 18, 40], [AIR.land - 60, -12, 18, -8, 14], [AIR.land + 40, -10, 26, -8, 22], [AIR.land + 150, 0, 0, 0, 0],
  [TURN_OUT[0] + 70, -10, 24, -8, 20], [TURN_OUT[1], 0, 0, 0, 0],
  [TURN_HOME[0] + 70, -10, 24, -8, 20], [TURN_HOME[1], 0, 0, 0, 0],
]);

export interface Pose {
  x: number; y: number; flip: number; squash: number; pitch: number; head: number; jaw: number;
  /** [upper, knee] angles; positive swings a paw forward. */
  frontNear: [number, number]; frontFar: [number, number]; hindNear: [number, number]; hindFar: [number, number];
  /** Tail target before spring smoothing. */
  tail: number;
  happy: boolean;
}

export function choreography(t: number): Pose {
  const x = xTrack(t);
  let y = 0;
  if (t > AIR.takeoff && t < AIR.land) {
    const u = (t - AIR.takeoff) / (AIR.land - AIR.takeoff);
    y = -JUMP * 4 * u * (1 - u);
  }
  for (const [start, end] of [TURN_OUT, TURN_HOME]) {
    const u = window01(t, start, end);
    if (u > 0 && u < 1) y -= 7 * Math.sin(Math.PI * u);
  }
  let flip = 1;
  if (t >= TURN_OUT[0] && t < TURN_HOME[0]) flip = Math.cos(Math.PI * sine(window01(t, ...TURN_OUT)));
  else if (t >= TURN_HOME[0]) flip = -Math.cos(Math.PI * sine(window01(t, ...TURN_HOME)));

  // Gaits are driven by distance travelled so paws do not skate.
  const galloping = gallop(t);
  const trotting = trot(t);
  const gallopPhase = (-Math.min(0, xTrack(Math.min(t, AIR.takeoff)))) / 24 * Math.PI * 2;
  const trotPhase = Math.max(0, x - xTrack(TROT[0])) / 15 * Math.PI * 2;
  y -= galloping * 2.6 * (1 - Math.cos(2 * gallopPhase)) / 2 + trotting * 1.4 * (1 - Math.cos(2 * trotPhase)) / 2;

  const gallopLeg = (phase: number, front: boolean): [number, number] => front
    ? [32 * Math.sin(phase) + 6, -62 * Math.max(0, Math.cos(phase))]
    : [28 * Math.sin(phase + Math.PI) - 4, 50 * Math.max(0, Math.cos(phase + Math.PI))];
  const trotLeg = (phase: number, front: boolean): [number, number] => front
    ? [22 * Math.sin(phase), -40 * Math.max(0, Math.cos(phase))]
    : [20 * Math.sin(phase), 34 * Math.max(0, Math.cos(phase))];
  const leg = (keys: (t: number) => number, knee: (t: number) => number, front: boolean, offset: number, trotOffset: number): [number, number] => {
    const g = gallopLeg(gallopPhase + offset, front);
    const r = trotLeg(trotPhase + trotOffset, front);
    return [keys(t) + galloping * g[0] + trotting * r[0], knee(t) + galloping * g[1] + trotting * r[1]];
  };
  const wag = wagAmount(t) * Math.sin(t / 1000 * Math.PI * 2 * 6.5);
  const happyWindow = (t > TIMING.catch + 40 && t < TIMING.catch + 230) || (t > TIMING.pop + 30 && t < TIMING.end - 60);
  return {
    x, y, flip,
    squash: squashTrack(t),
    pitch: pitchTrack(t) + galloping * 3 * Math.sin(gallopPhase),
    head: headTrack(t) - galloping * 2 * Math.sin(gallopPhase),
    jaw: jawTrack(t),
    frontNear: leg(frontLegs[0], frontLegs[1], true, 0, 0),
    frontFar: leg(frontLegs[2], frontLegs[3], true, .7, Math.PI),
    hindNear: leg(hindLegs[0], hindLegs[1], false, 0, Math.PI),
    hindFar: leg(hindLegs[2], hindLegs[3], false, .7, 0),
    tail: tailLift(t) + wag,
    happy: happyWindow,
  };
}

/* ------------------------------------------------------------ kinematics */

type Matrix = [number, number, number, number, number, number];
const multiply = (m: Matrix, n: Matrix): Matrix => [
  m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5],
];
const rotation = (degrees: number, [cx, cy]: Point): Matrix => {
  const r = degrees * Math.PI / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  return [cos, sin, -sin, cos, cx - cos * cx + sin * cy, cy - sin * cx - cos * cy];
};
const apply = (m: Matrix, [x, y]: Point): Point => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

function rootMatrix(pose: Pose): Matrix {
  const [px, py] = PIVOT.root;
  const sx = pose.flip * (1 + (1 - pose.squash) * .7);
  return [sx, 0, 0, pose.squash, pose.x + px - sx * px, pose.y + py - pose.squash * py];
}

/** Where the bite point is, in SVG user units, for a pose. */
export function biteAt(pose: Pose): Point {
  const m = multiply(multiply(rootMatrix(pose), rotation(pose.pitch, PIVOT.body)), rotation(pose.head, PIVOT.head));
  return apply(m, PIVOT.bite);
}

/** Facing (-1 or 1) and the head's world angle, for things held in the mouth. */
export function headAngle(pose: Pose): number {
  return (pose.pitch + pose.head) * Math.sign(pose.flip || 1);
}

/* ---------------------------------------------------- secondary motion */

/**
 * Springs for ears, tail, and the carried card. They respond to the body's
 * acceleration, so ears stream behind a run and float up while airborne.
 * Fixed sub-steps keep the result independent of frame rate.
 */
export class Springs {
  value: Secondary & { card: number } = { ...REST_SECONDARY, card: 0 };
  private velocity = { earSwing: 0, earLift: 0, tail: 0, card: 0 };
  private time = 0;
  private readonly pose: (t: number) => Pose;

  constructor(pose: (t: number) => Pose) {
    this.pose = pose;
  }

  advance(to: number) {
    const step = 4;
    const gravity = 8 * JUMP / ((AIR.land - AIR.takeoff) / 1000) ** 2;
    while (this.time + step <= to) {
      const t = this.time + step;
      const h = step / 1000;
      const [a, b, c] = [this.pose(t - 2 * step), this.pose(t - step), this.pose(t)];
      const ax = (c.x - 2 * b.x + a.x) / (h * h);
      const ay = (c.y - 2 * b.y + a.y) / (h * h);
      const facing = Math.sign(c.flip || 1);
      const forward = Math.max(-6000, Math.min(6000, ax * facing));
      const weightless = Math.max(-.3, Math.min(.9, ay / gravity));
      const target = { earSwing: 0, earLift: weightless, tail: c.tail, card: 0 };
      const push = { earSwing: forward * .012, earLift: 0, tail: -forward * .01, card: -forward * .01 };
      const tuning = { earSwing: [160, 9], earLift: [420, 24], tail: [420, 20], card: [140, 7] } as const;
      for (const key of ["earSwing", "earLift", "tail", "card"] as const) {
        const [stiffness, damping] = tuning[key];
        this.velocity[key] += (stiffness * (target[key] - this.value[key]) - damping * this.velocity[key] + push[key] * 60) * h;
        this.value[key] += this.velocity[key] * h;
      }
      this.time = t;
    }
    return this.value;
  }
}

/* ------------------------------------------------------------------- rig */

const BONES = ["root", "body", "head", "jaw", "frontNear", "frontNearKnee", "frontFar", "frontFarKnee", "hindNear", "hindNearKnee", "hindFar", "hindFarKnee"] as const;
type Bone = typeof BONES[number];

export class DogRig {
  private bones: Record<Bone, Element[]>;
  private parts: { earNear: Element; earFar: Element; tail: Element; shadow: Element };
  private readonly svg: SVGSVGElement;

  constructor(svg: SVGSVGElement) {
    this.svg = svg;
    this.bones = Object.fromEntries(BONES.map((bone) => [bone, [...svg.querySelectorAll(`[data-bone="${bone}"]`)]])) as Record<Bone, Element[]>;
    this.parts = {
      earNear: svg.querySelector(`#${ID}-earNear`)!,
      earFar: svg.querySelector(`#${ID}-earFar`)!,
      tail: svg.querySelector(`#${ID}-tail`)!,
      shadow: svg.querySelector("[data-shadow]")!,
    };
  }

  private set(bone: Bone, transform: string) {
    for (const element of this.bones[bone]) element.setAttribute("transform", transform);
  }

  apply(pose: Pose, secondary: Secondary) {
    const [a, b, c, d, e, f] = rootMatrix(pose);
    this.set("root", `matrix(${[a, b, c, d, e, f].map(fmt).join(" ")})`);
    const rotate = (bone: Bone, degrees: number, pivot: Point) => this.set(bone, `rotate(${fmt(degrees)} ${pivot[0]} ${pivot[1]})`);
    rotate("body", pose.pitch, PIVOT.body);
    rotate("head", pose.head, PIVOT.head);
    rotate("jaw", pose.jaw, PIVOT.jaw);
    for (const leg of ["frontNear", "frontFar", "hindNear", "hindFar"] as const) {
      rotate(leg, pose[leg][0], PIVOT[leg]);
      rotate(`${leg}Knee`, pose[leg][1], PIVOT[`${leg}Knee`]);
    }
    this.parts.earNear.setAttribute("d", earNearPath(secondary));
    this.parts.earFar.setAttribute("d", earFarPath(secondary));
    this.parts.tail.setAttribute("d", tailPath(secondary));
    // The shadow stays on the ground, follows the body, and shrinks as the dog leaves it.
    const [sx, sy] = PIVOT.shadow;
    const centre = PIVOT.root[0] + (sx - PIVOT.root[0]) * pose.flip + pose.x;
    const lift = Math.max(.45, 1 + pose.y / 40);
    this.parts.shadow.setAttribute("transform", `translate(${fmt(centre)} ${sy}) scale(${fmt(lift * Math.max(.55, Math.abs(pose.flip)))} 1) translate(${-sx} ${-sy})`);
    this.parts.shadow.setAttribute("opacity", fmt(.4 + .6 * lift));
    this.svg.classList.toggle("is-mouth-open", pose.jaw < -4);
    this.svg.classList.toggle("is-happy", pose.happy);
  }

  reset() {
    for (const elements of Object.values(this.bones)) for (const element of elements) element.removeAttribute("transform");
    this.parts.shadow.removeAttribute("transform");
    this.parts.shadow.removeAttribute("opacity");
    this.parts.earNear.setAttribute("d", earNearPath(REST_SECONDARY));
    this.parts.earFar.setAttribute("d", earFarPath(REST_SECONDARY));
    this.parts.tail.setAttribute("d", tailPath(REST_SECONDARY));
    this.svg.classList.remove("is-mouth-open", "is-happy");
  }
}
