// The game's state: which differences are found, the score, the timer and the
// mistakes. One state object is shared by the loop, the renderer and the shots.
import { DIFFERENCES, differenceAt } from './differences.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_WIN = 'win';

export const POINTS_FOUND = 100;
export const POINTS_WRONG = -15;
export const TIME_BONUS_PER_SECOND = 5;
export const PAR_SECONDS = 120;
export const BEST_KEY = 'lantern-garden-best';

export function createState() {
  return {
    screen: SCREEN_TITLE,
    found: new Set(),
    foundOrder: [],
    score: 0,
    wrong: 0,
    clicks: 0,
    elapsed: 0,
    hint: null,
    hintUntil: 0,
    wrongMark: null,
    wrongMarkUntil: 0,
    best: 0,
    newBest: false,
    wonAt: 0,
  };
}

/** Start (or restart) a round: everything found is forgotten, the clock restarts. */
export function resetState(state) {
  state.screen = SCREEN_PLAY;
  state.found = new Set();
  state.foundOrder = [];
  state.score = 0;
  state.wrong = 0;
  state.clicks = 0;
  state.elapsed = 0;
  state.hint = null;
  state.newBest = false;
  state.wrongMark = null;
}

/** Advance the clock by `dt` seconds while playing. */
export function tickState(state, dt) {
  if (state.screen !== SCREEN_PLAY) return;
  state.elapsed += dt;
}

/**
 * Try the scene point (x, y) on either panel. Returns 'found', 'already' or
 * 'miss'. Finding a difference scores points; a miss costs points and leaves
 * a red cross where the player clicked.
 */
export function tryPoint(state, x, y, now) {
  if (state.screen !== SCREEN_PLAY) return 'idle';
  state.clicks += 1;
  const difference = differenceAt(x, y);
  if (difference === null) {
    state.wrong += 1;
    state.score = Math.max(0, state.score + POINTS_WRONG);
    state.wrongMark = { x, y };
    state.wrongMarkUntil = now + 0.9;
    return 'miss';
  }
  if (state.found.has(difference.id)) return 'already';
  state.found.add(difference.id);
  state.foundOrder.push(difference.id);
  state.score += POINTS_FOUND;
  state.hint = null;
  if (state.found.size === DIFFERENCES.length) {
    const bonus = Math.max(0, Math.round((PAR_SECONDS - state.elapsed) * TIME_BONUS_PER_SECOND));
    state.score += bonus;
    state.wonAt = state.elapsed;
    state.screen = SCREEN_WIN;
    return 'win';
  }
  return 'found';
}

/** Point at one difference the player has not found yet, for a short while. */
export function useHint(state, now) {
  if (state.screen !== SCREEN_PLAY) return null;
  const remaining = DIFFERENCES.filter((d) => !state.found.has(d.id));
  if (remaining.length === 0) return null;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  state.hint = pick;
  state.hintUntil = now + 2.5;
  state.score = Math.max(0, state.score - 25);
  return pick;
}

export function remainingCount(state) {
  return DIFFERENCES.length - state.found.size;
}

export function accuracy(state) {
  if (state.clicks === 0) return 100;
  return Math.round(((state.clicks - state.wrong) / state.clicks) * 100);
}

/** Mark `count` differences as already found, in definition order (screenshot staging). */
export function markFound(state, count) {
  for (let i = 0; i < Math.min(count, DIFFERENCES.length); i += 1) {
    state.found.add(DIFFERENCES[i].id);
    state.foundOrder.push(DIFFERENCES[i].id);
  }
  state.score = state.found.size * POINTS_FOUND;
}
