// Tiny original sounds, synthesised with WebAudio: no audio file is loaded.
// A found difference chimes, a miss buzzes low, a hint ticks, winning plays
// a short rising arpeggio. Everything is silent until the first interaction.
let audioContext = null;

function context() {
  if (audioContext === null) {
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

function tone(frequency, startIn, length, type, volume) {
  const ctx = context();
  if (ctx === null) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, ctx.currentTime + startIn);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startIn + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startIn + length);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(ctx.currentTime + startIn);
  oscillator.stop(ctx.currentTime + startIn + length + 0.05);
}

export function playFound() {
  tone(660, 0, 0.18, 'sine', 0.18);
  tone(880, 0.09, 0.25, 'sine', 0.18);
}

export function playMiss() {
  tone(140, 0, 0.22, 'sawtooth', 0.08);
}

export function playHint() {
  tone(520, 0, 0.1, 'triangle', 0.12);
}

export function playWin() {
  [523, 659, 784, 1047].forEach((frequency, index) => {
    tone(frequency, index * 0.12, 0.3, 'sine', 0.18);
  });
}

export function playClick() {
  tone(440, 0, 0.06, 'triangle', 0.08);
}
