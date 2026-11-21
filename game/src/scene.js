// Draws the Lantern Garden scene: one function paints both pictures, so the two
// panels are near-identical by construction. `flags` switches the eight differences
// on (the right picture) or off (the left picture, the original). Everything is
// drawn with canvas paths — no image, font or sound file is loaded.
import { PANEL_HEIGHT, PANEL_WIDTH } from './differences.js';

const SKY_TOP = '#2b2350';
const SKY_MID = '#6b4a7a';
const SKY_LOW = '#e08a5a';

function sky(ctx) {
  const gradient = ctx.createLinearGradient(0, 0, 0, PANEL_HEIGHT * 0.62);
  gradient.addColorStop(0, SKY_TOP);
  gradient.addColorStop(0.55, SKY_MID);
  gradient.addColorStop(1, SKY_LOW);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT * 0.62);
}

function stars(ctx) {
  ctx.fillStyle = '#fff8d6';
  const points = [
    [40, 40], [180, 30], [260, 60], [330, 26], [420, 44], [520, 30], [560, 70],
    [150, 110], [300, 100], [470, 110], [30, 150], [540, 150], [220, 140], [380, 150],
  ];
  for (const [x, y] of points) {
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  // A shooting star in the upper sky.
  ctx.strokeStyle = 'rgba(255, 248, 214, 0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(480, 46);
  ctx.lineTo(522, 68);
  ctx.stroke();
}

function moon(ctx, crescent) {
  ctx.fillStyle = '#ffeebb';
  ctx.beginPath();
  ctx.arc(92, 82, 30, 0, Math.PI * 2);
  ctx.fill();
  if (crescent) {
    // A bite out of the moon: the sky colour painted over one side.
    ctx.fillStyle = SKY_TOP;
    ctx.beginPath();
    ctx.arc(104, 74, 26, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#e8c96a';
    for (const [x, y, r] of [[82, 74, 5], [100, 92, 4], [78, 94, 3]]) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function hills(ctx) {
  ctx.fillStyle = '#3d5a3a';
  ctx.beginPath();
  ctx.moveTo(0, 380);
  ctx.quadraticCurveTo(180, 330, 360, 378);
  ctx.quadraticCurveTo(480, 405, PANEL_WIDTH, 372);
  ctx.lineTo(PANEL_WIDTH, PANEL_HEIGHT);
  ctx.lineTo(0, PANEL_HEIGHT);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#466b41';
  ctx.beginPath();
  ctx.moveTo(0, 430);
  ctx.quadraticCurveTo(220, 392, 420, 428);
  ctx.quadraticCurveTo(520, 445, PANEL_WIDTH, 420);
  ctx.lineTo(PANEL_WIDTH, PANEL_HEIGHT);
  ctx.lineTo(0, PANEL_HEIGHT);
  ctx.closePath();
  ctx.fill();
}

function tree(ctx, missingApple) {
  // Trunk.
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(108, 250, 18, 130);
  ctx.beginPath();
  ctx.moveTo(117, 260);
  ctx.lineTo(96, 210);
  ctx.lineTo(112, 208);
  ctx.lineTo(126, 252);
  ctx.closePath();
  ctx.fill();
  // Canopy: three overlapping crowns.
  ctx.fillStyle = '#2f6b2f';
  for (const [x, y, r] of [[90, 190, 52], [150, 168, 58], [196, 198, 48]]) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#3a7d33';
  for (const [x, y, r] of [[110, 176, 34], [168, 184, 30]]) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // Apples: three on the left picture, two on the right.
  const apples = missingApple ? [[120, 210], [176, 172]] : [[120, 210], [176, 172], [148, 196]];
  ctx.fillStyle = '#e23b3b';
  for (const [x, y] of apples) {
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7a2d12';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 8);
    ctx.lineTo(x + 3, y - 14);
    ctx.stroke();
  }
}

function cottage(ctx, darkWindow) {
  // Walls and roof.
  ctx.fillStyle = '#f2d8a7';
  ctx.fillRect(268, 232, 104, 78);
  ctx.fillStyle = '#a34d2d';
  ctx.beginPath();
  ctx.moveTo(256, 234);
  ctx.lineTo(320, 188);
  ctx.lineTo(384, 234);
  ctx.closePath();
  ctx.fill();
  // Door.
  ctx.fillStyle = '#6b3a1f';
  ctx.fillRect(308, 272, 24, 38);
  ctx.fillStyle = '#ffd76a';
  ctx.beginPath();
  ctx.arc(328, 292, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Round window: warm and lit on the left, dark on the right.
  ctx.fillStyle = darkWindow ? '#2c2440' : '#ffd76a';
  ctx.beginPath();
  ctx.arc(318, 252, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#6b3a1f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(318, 252, 13, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(305, 252);
  ctx.lineTo(331, 252);
  ctx.moveTo(318, 239);
  ctx.lineTo(318, 265);
  ctx.stroke();
  if (!darkWindow) {
    // A cat silhouette in the lit window.
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.arc(318, 258, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(314, 254);
    ctx.lineTo(312, 248);
    ctx.lineTo(317, 253);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(322, 254);
    ctx.lineTo(324, 248);
    ctx.lineTo(319, 253);
    ctx.closePath();
    ctx.fill();
  }
  // Chimney with a curl of smoke.
  ctx.fillStyle = '#8a5a3a';
  ctx.fillRect(352, 196, 16, 26);
  ctx.strokeStyle = 'rgba(240, 240, 240, 0.75)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(360, 192);
  ctx.quadraticCurveTo(372, 176, 360, 162);
  ctx.quadraticCurveTo(350, 150, 360, 138);
  ctx.stroke();
  ctx.lineCap = 'butt';
}

function fence(ctx, noCat) {
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(0, 402, PANEL_WIDTH, 8);
  for (const x of [30, 110, 190, 270, 350, 430, 510, 570]) {
    ctx.fillRect(x, 386, 10, 40);
    ctx.beginPath();
    ctx.moveTo(x, 386);
    ctx.lineTo(x + 5, 376);
    ctx.lineTo(x + 10, 386);
    ctx.closePath();
    ctx.fill();
  }
  if (!noCat) {
    // A black cat sitting on the fence, tail curled.
    ctx.fillStyle = '#1d1a24';
    ctx.beginPath();
    ctx.ellipse(436, 372, 16, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(452, 360, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(446, 353);
    ctx.lineTo(444, 344);
    ctx.lineTo(449, 352);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(456, 353);
    ctx.lineTo(458, 344);
    ctx.lineTo(460, 352);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1d1a24';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(422, 378);
    ctx.quadraticCurveTo(406, 380, 408, 366);
    ctx.stroke();
  }
}

function lanternPost(ctx, red) {
  // Post.
  ctx.fillStyle = '#4a3220';
  ctx.fillRect(506, 300, 8, 108);
  ctx.beginPath();
  ctx.moveTo(506, 300);
  ctx.lineTo(528, 300);
  ctx.lineTo(520, 288);
  ctx.lineTo(514, 288);
  ctx.closePath();
  ctx.fill();
  // Hanging paper lantern: warm yellow on the left, red on the right.
  const glow = red ? 'rgba(255, 80, 60, 0.35)' : 'rgba(255, 200, 90, 0.45)';
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(514, 318, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = red ? '#d93a2b' : '#ffcf4d';
  ctx.beginPath();
  ctx.ellipse(514, 318, 18, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = red ? '#8f1f14' : '#b8860b';
  ctx.lineWidth = 2;
  for (const y of [306, 318, 330]) {
    ctx.beginPath();
    ctx.moveTo(498, y);
    ctx.quadraticCurveTo(514, y + 4, 530, y);
    ctx.stroke();
  }
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(510, 294, 8, 4);
  ctx.fillRect(510, 338, 8, 5);
}

function pond(ctx, noFrog) {
  ctx.fillStyle = '#3f6fb5';
  ctx.beginPath();
  ctx.ellipse(430, 560, 120, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5b8fd6';
  ctx.beginPath();
  ctx.ellipse(410, 552, 70, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  // Lily pads.
  ctx.fillStyle = '#3f8f4f';
  for (const [x, y, r] of [[380, 566, 22], [452, 556, 24], [500, 572, 18]]) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // Pink lotus on the left pad.
  ctx.fillStyle = '#f2a0c0';
  for (let i = 0; i < 5; i += 1) {
    const angle = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(380 + Math.cos(angle) * 8, 566 + Math.sin(angle) * 5, 7, 4, angle, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#ffd76a';
  ctx.beginPath();
  ctx.arc(380, 566, 4, 0, Math.PI * 2);
  ctx.fill();
  if (!noFrog) {
    // A green frog on the middle pad.
    ctx.fillStyle = '#58a83c';
    ctx.beginPath();
    ctx.ellipse(452, 552, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(444, 542, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(460, 542, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(444, 541, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(460, 541, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1d1a24';
    ctx.beginPath();
    ctx.arc(444, 541, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(460, 541, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function flowers(ctx, noButterfly) {
  const beds = [
    { x: 150, y: 500, colour: '#e86a9b' },
    { x: 200, y: 520, colour: '#f2c14e' },
    { x: 250, y: 496, colour: '#e86a9b' },
    { x: 60, y: 520, colour: '#f2c14e' },
    { x: 560, y: 500, colour: '#e86a9b' },
  ];
  for (const bed of beds) {
    ctx.strokeStyle = '#2f6b2f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bed.x, bed.y);
    ctx.lineTo(bed.x, bed.y - 16);
    ctx.stroke();
    ctx.fillStyle = bed.colour;
    for (let i = 0; i < 5; i += 1) {
      const angle = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(bed.x + Math.cos(angle) * 7, bed.y - 20 + Math.sin(angle) * 7, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.arc(bed.x, bed.y - 20, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!noButterfly) {
    // An orange butterfly above the flower bed.
    ctx.fillStyle = '#f28c28';
    ctx.beginPath();
    ctx.ellipse(174, 482, 9, 12, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(190, 482, 9, 12, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(176, 478, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(188, 478, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(182, 472);
    ctx.lineTo(182, 496);
    ctx.stroke();
  }
}

function mushrooms(ctx, plain) {
  // Two mushrooms at the foot of the tree.
  for (const [x, y, s] of [[96, 578, 1], [128, 590, 0.7]]) {
    ctx.fillStyle = '#f2e8d5';
    ctx.fillRect(x - 3 * s, y, 6 * s, 12 * s);
    ctx.fillStyle = plain ? '#8a6a45' : '#d93a2b';
    ctx.beginPath();
    ctx.arc(x, y, 14 * s, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    if (!plain) {
      ctx.fillStyle = '#ffffff';
      for (const [dx, dy, r] of [[-7, -6, 2.5], [2, -10, 3], [8, -4, 2]]) {
        ctx.beginPath();
        ctx.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function fireflies(ctx) {
  ctx.fillStyle = 'rgba(255, 240, 140, 0.9)';
  for (const [x, y] of [[300, 460], [340, 500], [540, 440], [70, 450], [250, 540]]) {
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Paint the whole garden into `ctx`, which is already translated to the panel origin. */
export function drawScene(ctx, flags) {
  ctx.save();
  ctx.clearRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT);
  sky(ctx);
  stars(ctx);
  moon(ctx, flags.crescentMoon);
  hills(ctx);
  tree(ctx, flags.missingApple);
  cottage(ctx, flags.darkWindow);
  fence(ctx, flags.noCat);
  lanternPost(ctx, flags.redLantern);
  pond(ctx, flags.noFrog);
  flowers(ctx, flags.noButterfly);
  mushrooms(ctx, flags.plainMushroom);
  fireflies(ctx);
  ctx.restore();
}
