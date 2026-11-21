// Paints everything: the header with the counter of differences left, the two
// garden panels side by side, the green rings on the differences found, the
// keyboard crosshair, and the title, paused and win overlays. The canvas is a
// fixed 1280 by 800 stage, scaled by CSS to the window.
import { DIFFERENCES, LEFT_FLAGS, PANEL_HEIGHT, PANEL_WIDTH, RIGHT_FLAGS } from './differences.js';
import { drawScene } from './scene.js';
import { SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN, accuracy, remainingCount } from './state.js';

export const STAGE_WIDTH = 1280;
export const STAGE_HEIGHT = 800;
const HEADER_HEIGHT = 72;
const GAP = 20;
const PANEL_X = [20, 660];
const PANEL_Y = HEADER_HEIGHT + 8;
const FOOTER_Y = 776;

function formatTime(seconds) {
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function drawHeader(ctx, state) {
  ctx.fillStyle = '#1c1633';
  ctx.fillRect(0, 0, STAGE_WIDTH, HEADER_HEIGHT);
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('🏮 Lantern Garden', 20, HEADER_HEIGHT / 2);

  // The counter of differences left: the number the screenshots must show.
  const remaining = remainingCount(state);
  ctx.fillStyle = remaining === 0 ? '#7ddc7d' : '#ffb84d';
  roundRect(ctx, 470, 12, 320, 48, 10);
  ctx.fill();
  ctx.fillStyle = '#241a12';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.textAlign = 'center';
  const found = DIFFERENCES.length - remaining;
  ctx.fillText(`${found} found  •  ${remaining} left`, 630, 37);

  ctx.fillStyle = '#efe8ff';
  ctx.font = '20px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText(`⏱ ${formatTime(state.elapsed)}`, 900, 26);
  ctx.fillText(`★ ${state.score}`, 900, 54);
  ctx.fillStyle = '#9d8fd0';
  ctx.font = '16px Georgia, serif';
  ctx.fillText(`Best ${state.best}`, 1010, 54);
  ctx.fillStyle = '#efe8ff';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText('H hint  •  P pause  •  R restart', 1260, 37);
}

function drawPanelFrame(ctx, panel, label) {
  const x = PANEL_X[panel];
  ctx.strokeStyle = '#4a3d6b';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, PANEL_Y, PANEL_WIDTH, PANEL_HEIGHT);
  ctx.fillStyle = '#efe8ff';
  ctx.font = 'bold 17px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(label, x + 4, PANEL_Y - 6);
}

/** A green ring (and a tick) on a found difference, on both panels at once. */
function drawFoundMarker(ctx, difference) {
  for (const panel of [0, 1]) {
    const x = PANEL_X[panel] + difference.x;
    const y = PANEL_Y + difference.y;
    ctx.strokeStyle = '#37d67a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, difference.r + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#37d67a';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 8, y);
    ctx.lineTo(x - 2, y + 6);
    ctx.lineTo(x + 9, y - 7);
    ctx.stroke();
    ctx.lineCap = 'butt';
  }
}

function drawWrongMark(ctx, state, now) {
  if (!state.wrongMark || now > state.wrongMarkUntil) return;
  for (const panel of [0, 1]) {
    const x = PANEL_X[panel] + state.wrongMark.x;
    const y = PANEL_Y + state.wrongMark.y;
    ctx.strokeStyle = '#ff5a4d';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 9, y - 9);
    ctx.lineTo(x + 9, y + 9);
    ctx.moveTo(x + 9, y - 9);
    ctx.lineTo(x - 9, y + 9);
    ctx.stroke();
    ctx.lineCap = 'butt';
  }
}

function drawHint(ctx, state, now) {
  if (!state.hint || now > state.hintUntil) return;
  const difference = state.hint;
  const pulse = 3 + Math.sin(now * 10) * 1.5;
  for (const panel of [0, 1]) {
    const x = PANEL_X[panel] + difference.x;
    const y = PANEL_Y + difference.y;
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = pulse;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(x, y, difference.r + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawCursor(ctx, cursor) {
  if (!cursor.visible) return;
  const x = PANEL_X[cursor.panel] + cursor.x;
  const y = PANEL_Y + cursor.y;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 24, y);
  ctx.lineTo(x - 10, y);
  ctx.moveTo(x + 10, y);
  ctx.lineTo(x + 24, y);
  ctx.moveTo(x, y - 24);
  ctx.lineTo(x, y - 10);
  ctx.moveTo(x, y + 10);
  ctx.lineTo(x, y + 24);
  ctx.stroke();
}

function drawFoundList(ctx, state) {
  ctx.fillStyle = '#9d8fd0';
  ctx.font = '13px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  let text = 'Found: ';
  text += state.foundOrder.length === 0
    ? '—'
    : state.foundOrder.map((id) => DIFFERENCES.find((d) => d.id === id).short).join('  •  ');
  ctx.fillText(text.slice(0, 145), 20, FOOTER_Y);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#efe8ff';
  ctx.fillText('Click a difference, or ← ↑ ↓ → + Enter', 1260, FOOTER_Y);
}

function dim(ctx) {
  ctx.fillStyle = 'rgba(16, 12, 32, 0.72)';
  ctx.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
}

function overlayCard(ctx, width, height) {
  const x = (STAGE_WIDTH - width) / 2;
  const y = (STAGE_HEIGHT - height) / 2;
  ctx.fillStyle = '#241d45';
  roundRect(ctx, x, y, width, height, 16);
  ctx.fill();
  ctx.strokeStyle = '#ffd76a';
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, width, height, 16);
  ctx.stroke();
  return { x, y };
}

function drawTitle(ctx, state) {
  dim(ctx);
  const { x, y } = overlayCard(ctx, 640, 420);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 40px Georgia, serif';
  ctx.fillText('🏮 Lantern Garden', 640, y + 72);
  ctx.fillStyle = '#efe8ff';
  ctx.font = '24px Georgia, serif';
  ctx.fillText('Spot the Difference', 640, y + 112);
  ctx.fillStyle = '#cbb8ff';
  ctx.font = '18px Georgia, serif';
  ctx.fillText('Two pictures of the same garden at dusk.', 640, y + 168);
  ctx.fillText('Eight things are different. Find them all!', 640, y + 196);
  ctx.fillText('Click a difference with the mouse, or move', 640, y + 232);
  ctx.fillText('the crosshair with the arrow keys and press Enter.', 640, y + 258);
  ctx.fillText('H hints at a difference (−25 points)  •  P pauses', 640, y + 294);
  ctx.fillStyle = '#37d67a';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText('Press Enter or click to start', 640, y + 352);
  if (state.best > 0) {
    ctx.fillStyle = '#9d8fd0';
    ctx.font = '16px Georgia, serif';
    ctx.fillText(`Best score: ${state.best}`, 640, y + 386);
  }
}

function drawPaused(ctx) {
  dim(ctx);
  const { y } = overlayCard(ctx, 420, 180);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 34px Georgia, serif';
  ctx.fillText('Paused', 640, y + 72);
  ctx.fillStyle = '#efe8ff';
  ctx.font = '18px Georgia, serif';
  ctx.fillText('Press P or Enter to keep playing', 640, y + 118);
}

function drawWin(ctx, state) {
  dim(ctx);
  const { x, y } = overlayCard(ctx, 640, 400);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 38px Georgia, serif';
  ctx.fillText('🎉 You found them all!', 640, y + 70);
  ctx.fillStyle = '#efe8ff';
  ctx.font = '22px Georgia, serif';
  ctx.fillText(`All 8 differences in ${formatTime(state.wonAt)}`, 640, y + 122);
  ctx.fillText(`Score ${state.score}   •   Accuracy ${accuracy(state)}%`, 640, y + 158);
  ctx.fillText(`Wrong clicks: ${state.wrong}`, 640, y + 192);
  if (state.newBest) {
    ctx.fillStyle = '#37d67a';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillText('★ New best score! ★', 640, y + 232);
  }
  ctx.fillStyle = '#cbb8ff';
  ctx.font = '18px Georgia, serif';
  ctx.fillText('Press R or Enter to play again', 640, y + 292);
  ctx.fillText('Press Escape for the title screen', 640, y + 322);
  void x;
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const left = document.createElement('canvas');
  left.width = PANEL_WIDTH;
  left.height = PANEL_HEIGHT;
  const right = document.createElement('canvas');
  right.width = PANEL_WIDTH;
  right.height = PANEL_HEIGHT;
  drawScene(left.getContext('2d'), LEFT_FLAGS);
  drawScene(right.getContext('2d'), RIGHT_FLAGS);

  return {
    /** Paint one frame of `state` at time `now` (seconds). */
    draw(state, cursor, now) {
      ctx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
      ctx.fillStyle = '#14102a';
      ctx.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
      drawHeader(ctx, state);
      drawPanelFrame(ctx, 0, 'A — Original');
      drawPanelFrame(ctx, 1, 'B — Changed');
      ctx.drawImage(left, PANEL_X[0], PANEL_Y);
      ctx.drawImage(right, PANEL_X[1], PANEL_Y);
      for (const difference of DIFFERENCES) {
        if (state.found.has(difference.id)) drawFoundMarker(ctx, difference);
      }
      drawHint(ctx, state, now);
      drawWrongMark(ctx, state, now);
      if (state.screen === SCREEN_PLAY) drawCursor(ctx, cursor);
      drawFoundList(ctx, state);
      if (state.screen === SCREEN_TITLE) drawTitle(ctx, state);
      else if (state.screen === SCREEN_PAUSED) drawPaused(ctx);
      else if (state.screen === SCREEN_WIN) drawWin(ctx, state);
    },
  };
}
