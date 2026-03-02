let audioCtx = null;
let muted = false;

// Restore mute preference from localStorage
try {
  muted = localStorage.getItem('samsara_muted') === 'true';
} catch (_) {
  // localStorage unavailable (SSR, tests, etc.)
}

/**
 * Initialize the AudioContext. Must be called from a user interaction
 * (click/tap) to satisfy browser autoplay policy.
 */
export function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (_) {
    // Web Audio API not available -- all sounds will silently no-op
  }
}

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = !!value;
  try {
    localStorage.setItem('samsara_muted', String(muted));
  } catch (_) {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function ensureReady() {
  if (!audioCtx || muted) return null;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Create an oscillator + gain pair with an envelope.
 * Returns { osc, gain } already connected to destination.
 */
function createTone(ctx, { type = 'sine', freq, startTime, attack, decay, sustain = 0, release = 0, peakGain = 0.12 }) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  // Envelope: attack -> peak -> decay -> sustain -> release
  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.linearRampToValueAtTime(peakGain, startTime + attack);
  gainNode.gain.linearRampToValueAtTime(peakGain * sustain, startTime + attack + decay);
  if (release > 0) {
    gainNode.gain.linearRampToValueAtTime(0.0001, startTime + attack + decay + release);
  }

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  const totalDuration = attack + decay + release + 0.05;
  osc.start(startTime);
  osc.stop(startTime + totalDuration);

  return { osc, gain: gainNode };
}

// ---------------------------------------------------------------------------
// Sound effects
// ---------------------------------------------------------------------------

/**
 * Temple bell -- sine wave ~800Hz, quick attack, long shimmer decay (~2s).
 * Played on: age advance, festival events.
 */
export function playBell() {
  const ctx = ensureReady();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Main bell tone
  createTone(ctx, {
    freq: 800,
    startTime: now,
    attack: 0.005,
    decay: 1.8,
    sustain: 0,
    release: 0.2,
    peakGain: 0.12,
  });

  // Shimmer overtone (slight frequency offset for beating)
  createTone(ctx, {
    freq: 803,
    startTime: now,
    attack: 0.005,
    decay: 1.5,
    sustain: 0,
    release: 0.2,
    peakGain: 0.06,
  });

  // Higher harmonic for brightness
  createTone(ctx, {
    freq: 1600,
    startTime: now,
    attack: 0.003,
    decay: 0.8,
    sustain: 0,
    release: 0.1,
    peakGain: 0.03,
  });
}

/**
 * Light chime -- sine at ~1200Hz, short decay (~0.5s).
 * Played on: making a choice.
 */
export function playChime() {
  const ctx = ensureReady();
  if (!ctx) return;

  const now = ctx.currentTime;

  createTone(ctx, {
    freq: 1200,
    startTime: now,
    attack: 0.003,
    decay: 0.4,
    sustain: 0,
    release: 0.1,
    peakGain: 0.1,
  });

  // Soft overtone
  createTone(ctx, {
    freq: 1802,
    startTime: now,
    attack: 0.003,
    decay: 0.25,
    sustain: 0,
    release: 0.05,
    peakGain: 0.04,
  });
}

/**
 * Pleasant ascending two-note tone for gaining merit.
 */
export function playMeritSound() {
  const ctx = ensureReady();
  if (!ctx) return;

  const now = ctx.currentTime;

  // First note -- C5
  createTone(ctx, {
    freq: 523,
    startTime: now,
    attack: 0.01,
    decay: 0.15,
    sustain: 0,
    release: 0.05,
    peakGain: 0.1,
  });

  // Second note -- E5 (ascending major third)
  createTone(ctx, {
    freq: 659,
    startTime: now + 0.12,
    attack: 0.01,
    decay: 0.25,
    sustain: 0,
    release: 0.1,
    peakGain: 0.1,
  });
}

/**
 * Low subtle tone for gaining demerit.
 */
export function playDemeritSound() {
  const ctx = ensureReady();
  if (!ctx) return;

  const now = ctx.currentTime;

  createTone(ctx, {
    type: 'triangle',
    freq: 220,
    startTime: now,
    attack: 0.02,
    decay: 0.4,
    sustain: 0,
    release: 0.15,
    peakGain: 0.08,
  });
}

/**
 * Gentle 3-note ascending sequence for screen transitions.
 */
export function playTransition() {
  const ctx = ensureReady();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [440, 523, 659]; // A4, C5, E5
  const spacing = 0.1;

  notes.forEach((freq, i) => {
    createTone(ctx, {
      freq,
      startTime: now + i * spacing,
      attack: 0.01,
      decay: 0.2,
      sustain: 0,
      release: 0.08,
      peakGain: 0.08,
    });
  });
}
