// Mouse and keyboard input. The mouse clicks a panel; the keyboard moves a
// crosshair with the arrow keys (Shift moves faster), Tab jumps it between the
// two panels, and Enter or Space checks the spot under the crosshair. H asks
// for a hint, P pauses, R restarts, Escape goes back to the title screen.
import { PANEL_HEIGHT, PANEL_WIDTH } from './differences.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_RESTART = 8;
export const ACTION_TITLE = 16;

/**
 * `toScene` converts a pointer event on the canvas into { panel: 0 | 1, x, y }
 * in scene coordinates, or null when the click lands outside both panels.
 * `cursor` is the keyboard crosshair, shared with the renderer so the player
 * can see where the next Enter will check.
 */
export function createInput(canvas, toScene) {
  const cursor = { panel: 0, x: PANEL_WIDTH / 2, y: PANEL_HEIGHT / 2, visible: false };
  let actions = 0;
  let click = null;

  function keyDown(event) {
    const step = event.shiftKey ? 28 : 9;
    switch (event.key) {
      case 'ArrowLeft':
        cursor.x = Math.max(0, cursor.x - step);
        cursor.visible = true;
        event.preventDefault();
        break;
      case 'ArrowRight':
        cursor.x = Math.min(PANEL_WIDTH, cursor.x + step);
        cursor.visible = true;
        event.preventDefault();
        break;
      case 'ArrowUp':
        cursor.y = Math.max(0, cursor.y - step);
        cursor.visible = true;
        event.preventDefault();
        break;
      case 'ArrowDown':
        cursor.y = Math.min(PANEL_HEIGHT, cursor.y + step);
        cursor.visible = true;
        event.preventDefault();
        break;
      case 'Tab':
        cursor.panel = 1 - cursor.panel;
        cursor.visible = true;
        event.preventDefault();
        break;
      case 'Enter':
      case ' ':
        actions |= ACTION_CONFIRM;
        cursor.visible = true;
        event.preventDefault();
        break;
      case 'p':
      case 'P':
        actions |= ACTION_PAUSE;
        break;
      case 'h':
      case 'H':
        actions |= ACTION_HINT;
        break;
      case 'r':
      case 'R':
        actions |= ACTION_RESTART;
        break;
      case 'Escape':
        actions |= ACTION_TITLE;
        break;
      default:
        break;
    }
  }

  function pointerDown(event) {
    const point = toScene(event);
    if (point !== null) {
      click = point;
      cursor.panel = point.panel;
      cursor.x = point.x;
      cursor.y = point.y;
      cursor.visible = false;
    }
  }

  window.addEventListener('keydown', keyDown);
  canvas.addEventListener('pointerdown', pointerDown);

  return {
    cursor,
    /** The actions queued since the last call, then cleared. */
    takeActions() {
      const queued = actions;
      actions = 0;
      return queued;
    },
    /** The mouse click queued since the last call, then cleared. */
    takeClick() {
      const queued = click;
      click = null;
      return queued;
    },
  };
}
