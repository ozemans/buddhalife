/**
 * Karma Engine for BuddhaLife
 *
 * Karma is NOT a single number. Merit and demerit accumulate separately.
 * Momentum tracks tendencies -- repeated good acts build virtuous momentum,
 * making future merit slightly more effective (and vice versa).
 * Uncertainty adds a small random factor to every karma change,
 * reflecting the Buddhist teaching that karma's workings are subtle and
 * not perfectly predictable by mortals.
 */

// Karma effect magnitudes by label
const KARMA_MAGNITUDES = {
  positive: { merit: 8, demerit: 0, momentumShift: 0.05 },
  negative: { merit: 0, demerit: 8, momentumShift: -0.05 },
  neutral: { merit: 1, demerit: 1, momentumShift: 0 },
  complex: { merit: 4, demerit: 4, momentumShift: 0 },
};

/**
 * Calculate the karma change from a choice.
 * Returns a new karma object (not a delta -- the full updated state).
 */
export function calculateKarmaChange(choice, currentKarma) {
  const effect = choice.karmaEffect || 'neutral';
  const magnitude = KARMA_MAGNITUDES[effect] || KARMA_MAGNITUDES.neutral;
  const intensity = choice.karmaIntensity || 1.0; // optional override per-choice

  const { merit, demerit, momentum, uncertainty } = currentKarma;

  // Base merit/demerit from this choice
  let meritGain = magnitude.merit * intensity;
  let demeritGain = magnitude.demerit * intensity;

  // Momentum modifier: past tendencies amplify matching actions slightly
  // If you've been virtuous (momentum > 0), merit gains get a small boost
  // If you've been troubled (momentum < 0), demerit gains get a small boost
  if (momentum > 0 && meritGain > 0) {
    meritGain *= (1 + momentum * 0.5);
  }
  if (momentum < 0 && demeritGain > 0) {
    demeritGain *= (1 + Math.abs(momentum) * 0.5);
  }

  // Diminishing returns on repeated merit-making
  // The more merit you already have, the less each new unit adds
  // This prevents infinite merit stacking and reflects the Buddhist idea
  // that mechanical merit-making without understanding yields less
  const meritDiminish = 1 / (1 + merit * 0.005);
  const demeritDiminish = 1 / (1 + demerit * 0.005);
  meritGain *= meritDiminish;
  demeritGain *= demeritDiminish;

  // Uncertainty: small random wobble on every karma transaction
  // Reflects the unknowability of karma's exact workings
  const wobble = (Math.random() - 0.5) * uncertainty * 10;
  meritGain = Math.max(0, meritGain + (wobble > 0 ? wobble : 0));
  demeritGain = Math.max(0, demeritGain + (wobble < 0 ? Math.abs(wobble) : 0));

  // Update momentum: decays slightly each action, then shifts
  const momentumDecay = 0.95;
  const newMomentum = clamp(
    momentum * momentumDecay + magnitude.momentumShift,
    -1,
    1
  );

  // Uncertainty drifts very slowly (the cosmos is unpredictable)
  const newUncertainty = clamp(
    uncertainty + (Math.random() - 0.5) * 0.02,
    0.01,
    0.3
  );

  return {
    merit: merit + meritGain,
    demerit: demerit + demeritGain,
    momentum: newMomentum,
    uncertainty: newUncertainty,
  };
}

/**
 * Get the net karma score (for quick comparison purposes).
 * This is a simplification -- the game should generally use
 * merit and demerit separately, but this is useful for thresholds.
 */
export function getNetKarma(karma) {
  return karma.merit - karma.demerit;
}

/**
 * Get a descriptive karma level based on the balance of merit and demerit.
 */
export function getKarmaLevel(karma) {
  const net = getNetKarma(karma);
  const total = karma.merit + karma.demerit;

  // If very little karma has accumulated either way, you're balanced
  if (total < 5) return 'balanced';

  const ratio = total > 0 ? net / total : 0;

  if (ratio > 0.6) return 'pure';
  if (ratio > 0.2) return 'virtuous';
  if (ratio > -0.2) return 'balanced';
  if (ratio > -0.6) return 'troubled';
  return 'burdened';
}

/**
 * Get a full karma display object for the UI.
 * Lotus stage maps to 5 stages of spiritual development:
 * 1 = buried in mud, 5 = fully bloomed above water
 */
export function getKarmaDisplay(karma) {
  const level = getKarmaLevel(karma);
  const net = getNetKarma(karma);
  const total = karma.merit + karma.demerit;

  const lotusStages = {
    burdened: 1,
    troubled: 2,
    balanced: 3,
    virtuous: 4,
    pure: 5,
  };

  const descriptions = {
    pure: 'Your actions radiate merit. Like the lotus risen above the water, your karma shines clearly.',
    virtuous: 'You walk a wholesome path. Merit outweighs demerit, and your momentum carries you toward the good.',
    balanced: 'Your karma is in equilibrium. Neither strongly meritorious nor burdened, the scales hang level.',
    troubled: 'Demerit weighs on your spirit. Like murky water obscuring the lotus, past actions cloud your path.',
    burdened: 'Heavy karma presses down. The weight of unwholesome actions demands attention and remedy.',
  };

  return {
    level,
    lotusStage: lotusStages[level],
    description: descriptions[level],
    merit: Math.round(karma.merit * 10) / 10,
    demerit: Math.round(karma.demerit * 10) / 10,
    momentum: karma.momentum,
    momentumDirection: karma.momentum > 0.1
      ? 'trending virtuous'
      : karma.momentum < -0.1
        ? 'trending troubled'
        : 'steady',
  };
}

/**
 * Check if karma qualifies for a specific range.
 * Used by eventSelector to filter events by karma prerequisites.
 * Range format: { minMerit, maxMerit, minDemerit, maxDemerit, level }
 */
export function karmaInRange(karma, range) {
  if (!range) return true;

  if (range.level) {
    const currentLevel = getKarmaLevel(karma);
    const levels = ['burdened', 'troubled', 'balanced', 'virtuous', 'pure'];
    if (Array.isArray(range.level)) {
      if (!range.level.includes(currentLevel)) return false;
    } else if (range.level !== currentLevel) {
      return false;
    }
  }

  if (range.minMerit !== undefined && karma.merit < range.minMerit) return false;
  if (range.maxMerit !== undefined && karma.merit > range.maxMerit) return false;
  if (range.minDemerit !== undefined && karma.demerit < range.minDemerit) return false;
  if (range.maxDemerit !== undefined && karma.demerit > range.maxDemerit) return false;

  return true;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
