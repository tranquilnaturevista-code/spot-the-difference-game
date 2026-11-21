// The screenshot scenes behind ?shot=start|play|late|end. Each one stages a real
// game state through the same state functions the player uses, so the frame is
// what the game really looks like at that moment: the play scene has three
// differences found (green rings on both panels, five still to find, the
// counter reading "3 found • 5 left"); late has six found; end has all eight
// found and the win overlay. The timer is fixed so the shots are deterministic.
import { DIFFERENCES } from './differences.js';
import { SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN, markFound } from './state.js';

const PLAY_FOUND = 3;
const LATE_FOUND = 6;
const PLAY_ELAPSED = 47;
const LATE_ELAPSED = 96;
const END_ELAPSED = 118;

export function stageShot(name, state) {
  if (name === 'end') {
    markFound(state, DIFFERENCES.length);
    state.elapsed = END_ELAPSED;
    state.wonAt = END_ELAPSED;
    state.screen = SCREEN_WIN;
    state.newBest = state.score > state.best;
    state.wrong = 1;
    state.clicks = 9;
    return;
  }
  if (name === 'late') {
    markFound(state, LATE_FOUND);
    state.elapsed = LATE_ELAPSED;
    state.screen = SCREEN_PLAY;
    return;
  }
  if (name === 'play') {
    markFound(state, PLAY_FOUND);
    state.elapsed = PLAY_ELAPSED;
    state.screen = SCREEN_PLAY;
    return;
  }
  state.screen = SCREEN_TITLE;
}
