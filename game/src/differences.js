// The eight differences of Lantern Garden, in the scene's own coordinates.
// Each panel is 600 wide and 620 tall; the same coordinates are used on both sides.
// `name` is the label shown once a difference is found. `r` is the click tolerance
// in scene pixels. `check` is only documentation: the two variants are drawn by
// scene.js from the flags below, so the pictures stay near-identical by construction.
export const PANEL_WIDTH = 600;
export const PANEL_HEIGHT = 620;

export const DIFFERENCES = [
  { id: 'moon', short: 'Moon', name: 'Moon phase', x: 92, y: 82, r: 34, flag: 'crescentMoon' },
  { id: 'apple', short: 'Apple', name: 'Missing apple', x: 148, y: 196, r: 26, flag: 'missingApple' },
  { id: 'window', short: 'Window', name: 'Cottage window', x: 318, y: 252, r: 30, flag: 'darkWindow' },
  { id: 'lantern', short: 'Lantern', name: 'Lantern colour', x: 512, y: 296, r: 30, flag: 'redLantern' },
  { id: 'cat', short: 'Cat', name: 'Cat on the fence', x: 436, y: 396, r: 32, flag: 'noCat' },
  { id: 'butterfly', short: 'Butterfly', name: 'Butterfly', x: 182, y: 486, r: 28, flag: 'noButterfly' },
  { id: 'frog', short: 'Frog', name: 'Frog on the lily pad', x: 452, y: 556, r: 30, flag: 'noFrog' },
  { id: 'mushroom', short: 'Mushroom', name: 'Mushroom cap', x: 96, y: 578, r: 28, flag: 'plainMushroom' },
];

/** The right-hand picture: every difference flag switched on. */
export const RIGHT_FLAGS = Object.fromEntries(DIFFERENCES.map((d) => [d.flag, true]));

/** The left-hand picture: the original, no flag switched on. */
export const LEFT_FLAGS = Object.fromEntries(DIFFERENCES.map((d) => [d.flag, false]));

/** The nearest difference within its tolerance of scene point (x, y), or null. */
export function differenceAt(x, y) {
  let best = null;
  let bestDistance = Infinity;
  for (const difference of DIFFERENCES) {
    const distance = Math.hypot(x - difference.x, y - difference.y);
    if (distance <= difference.r && distance < bestDistance) {
      best = difference;
      bestDistance = distance;
    }
  }
  return best;
}
