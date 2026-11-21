// Boot and the one loop: the state advances in fixed 1/60 s steps and the
// renderer paints what is there. The game moves between four screens: title,
// play, paused and win. Mouse clicks check the spot under the pointer; the
// keyboard crosshair checks the spot under it with Enter or Space.
//
// ?shot=start|play|late|end stages that scene instead of running the loop,
// paints it twice and sets window.__shotReady for a screenshot.
import { DIFFERENCES, PANEL_HEIGHT, PANEL_WIDTH } from './differences.js';
import { createState, resetState, tryPoint, tickState, useHint, BEST_KEY, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './state.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_PAUSE, ACTION_RESTART, ACTION_TITLE, createInput } from './input.js';
import { STAGE_HEIGHT, STAGE_WIDTH, createRenderer } from './render.js';
import { stageShot } from './shots.js';
import { playClick, playFound, playHint, playMiss, playWin } from './audio.js';

const STEP = 1 / 60;
const MAX_FRAME = 0.25;
const PANEL_X = [20, 660];
const PANEL_Y = 80;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const state = createState();
const renderer = createRenderer(canvas);

/** Any page error is recorded in the DOM so a headless check can see it. */
window.addEventListener('error', (event) => {
  const node = document.getElementById('errors');
  if (node) node.textContent += `${event.message}\n`;
});

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

/** Convert a pointer event into scene coordinates, or null outside the panels. */
function toScene(event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * STAGE_WIDTH;
  const y = ((event.clientY - rect.top) / rect.height) * STAGE_HEIGHT;
  for (let panel = 0; panel < 2; panel += 1) {
    if (x >= PANEL_X[panel] && x < PANEL_X[panel] + PANEL_WIDTH && y >= PANEL_Y && y < PANEL_Y + PANEL_HEIGHT) {
      return { panel, x: x - PANEL_X[panel], y: y - PANEL_Y };
    }
  }
  return null;
}

function announce(message) {
  status.textContent = message;
}

function startGame() {
  resetState(state);
  announce('Playing. Find 8 differences.');
}

function finishWin() {
  if (state.score > state.best) {
    state.newBest = true;
    state.best = state.score;
    saveBest(state.best);
  }
  playWin();
  announce(`You found them all! Score ${state.score}.`);
}

function checkPoint(point, now) {
  const result = tryPoint(state, point.x, point.y, now);
  if (result === 'found') {
    playFound();
    announce(`Found! ${state.found.size} of 8.`);
  } else if (result === 'miss') {
    playMiss();
    announce('Not a difference. Try again.');
  } else if (result === 'already') {
    playClick();
    announce('Already found.');
  } else if (result === 'win') {
    finishWin();
  }
}

function runShot(name) {
  state.best = 850;
  stageShot(name, state);
  let painted = 0;
  function paint() {
    renderer.draw(state, { panel: 0, x: 0, y: 0, visible: false }, 1);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas, toScene);
  state.best = readBest();
  let accumulator = 0;
  let last = performance.now();

  function handleActions(now) {
    const actions = input.takeActions();
    if (actions & ACTION_TITLE) {
      state.screen = SCREEN_TITLE;
      announce('Lantern Garden. Press Enter or click to start.');
      return;
    }
    if (actions & ACTION_RESTART && state.screen !== SCREEN_TITLE) {
      startGame();
      return;
    }
    if (actions & ACTION_CONFIRM) {
      if (state.screen === SCREEN_TITLE || state.screen === SCREEN_WIN) {
        startGame();
        playClick();
      } else if (state.screen === SCREEN_PAUSED) {
        state.screen = SCREEN_PLAY;
        announce('Playing.');
      } else if (state.screen === SCREEN_PLAY) {
        checkPoint({ x: input.cursor.x, y: input.cursor.y }, now);
      }
    }
    if (actions & ACTION_PAUSE) {
      if (state.screen === SCREEN_PLAY) {
        state.screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (state.screen === SCREEN_PAUSED) {
        state.screen = SCREEN_PLAY;
        announce('Playing.');
      }
    }
    if (actions & ACTION_HINT && state.screen === SCREEN_PLAY) {
      const hint = useHint(state, now);
      if (hint !== null) {
        playHint();
        announce('Hint: look near the ' + hint.name.toLowerCase() + '.');
      }
    }
  }

  function frame(nowMs) {
    requestAnimationFrame(frame);
    const now = nowMs / 1000;
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions(now);
    const click = input.takeClick();
    if (click !== null) {
      if (state.screen === SCREEN_TITLE || state.screen === SCREEN_WIN) {
        startGame();
        playClick();
      } else if (state.screen === SCREEN_PLAY) {
        checkPoint(click, now);
      }
    }
    if (state.screen === SCREEN_PLAY) {
      while (accumulator >= STEP) {
        tickState(state, STEP);
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(state, input.cursor, now);
  }

  // Leaving the tab pauses a running game rather than letting the clock run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.screen === SCREEN_PLAY) {
      state.screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Lantern Garden. Press Enter or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else if (params.get('selftest')) runSelfTest();
else runGame();

/**
 * A headless check (?selftest=1): plays the whole game through the real state
 * functions — one wrong click, then every difference in turn — and writes the
 * outcome plus every resource the page loaded into #selftest for inspection.
 */
function runSelfTest() {
  const node = document.getElementById('selftest');
  resetState(state);
  const results = [];
  results.push(`miss:${tryPoint(state, 300, 600, 0)}`);
  for (const difference of DIFFERENCES) {
    results.push(`${difference.id}:${tryPoint(state, difference.x, difference.y, 5)}`);
  }
  results.push(`repeat:${tryPoint(state, DIFFERENCES[0].x, DIFFERENCES[0].y, 6)}`);
  const resources = performance.getEntriesByType('resource').map((entry) => entry.name);
  const outcome = {
    results,
    screen: state.screen,
    found: state.found.size,
    score: state.score,
    wrong: state.wrong,
    clicks: state.clicks,
    resources,
  };
  if (node) node.textContent = `SELFTEST ${JSON.stringify(outcome)}`;
  renderer.draw(state, { panel: 0, x: 0, y: 0, visible: false }, 1);
  window.__shotReady = true;
}
