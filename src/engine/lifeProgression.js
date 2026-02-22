/**
 * Life Progression Engine for BuddhaLife
 *
 * Handles aging, life stage transitions, natural stat changes,
 * and death probability. The life course follows the Theravada/Shan
 * model: childhood vulnerability, adolescent ordination,
 * young adult household-building, midlife merit leadership,
 * and elder temple sleeping.
 */

const LIFE_STAGES = {
  childhood: { min: 0, max: 12, label: 'Childhood' },
  adolescence: { min: 13, max: 18, label: 'Adolescence' },
  young_adulthood: { min: 19, max: 30, label: 'Young Adulthood' },
  adulthood: { min: 31, max: 55, label: 'Adulthood' },
  elderhood: { min: 56, max: Infinity, label: 'Elderhood' },
};

/**
 * Get the life stage string for a given age.
 */
export function getLifeStage(age) {
  if (age <= 12) return 'childhood';
  if (age <= 18) return 'adolescence';
  if (age <= 30) return 'young_adulthood';
  if (age <= 55) return 'adulthood';
  return 'elderhood';
}

/**
 * Get the display label for a life stage.
 */
export function getLifeStageLabel(stage) {
  return LIFE_STAGES[stage]?.label || stage;
}

/**
 * Check whether the character has just transitioned to a new life stage.
 */
export function isLifeStageTransition(prevAge, newAge) {
  return getLifeStage(prevAge) !== getLifeStage(newAge);
}

/**
 * Advance one year and return the stat changes that should be applied.
 * This does NOT modify state -- it returns a change object for the reducer.
 */
export function advanceYear(state) {
  const age = state.character.age + 1;
  const stage = getLifeStage(age);
  const prevStage = state.lifeStage;
  const stageChanged = stage !== prevStage;

  const statChanges = calculateNaturalStatChanges(age, stage, state);

  return {
    statChanges,
    newAge: age,
    newStage: stage,
    stageChanged,
    stageTransitionText: stageChanged
      ? getStageTransitionText(stage, state)
      : null,
  };
}

/**
 * Calculate natural stat changes that happen each year due to aging.
 * These are small drifts that reflect the rhythms of a Southeast Asian life.
 */
function calculateNaturalStatChanges(age, stage, state) {
  const changes = {
    health: 0,
    happiness: 0,
    wealth: 0,
    wisdom: 0,
    socialStanding: 0,
    spiritualDev: 0,
  };

  switch (stage) {
    case 'childhood':
      // Children grow healthier, gain a little wisdom from learning
      changes.health += randBetween(0, 2);
      changes.wisdom += randBetween(0, 1);
      changes.happiness += randBetween(-1, 2);
      break;

    case 'adolescence':
      // Volatile happiness, some wisdom growth, health peaks
      changes.health += randBetween(0, 1);
      changes.wisdom += randBetween(1, 2);
      changes.happiness += randBetween(-3, 3);
      // Social standing starts to matter
      changes.socialStanding += randBetween(-1, 1);
      break;

    case 'young_adulthood':
      // Building wealth, accumulating wisdom, health stable
      changes.wealth += randBetween(-1, 2);
      changes.wisdom += randBetween(1, 2);
      changes.socialStanding += randBetween(0, 1);
      // Slight spiritual growth if already on that path
      if (state.stats.spiritualDev > 10) {
        changes.spiritualDev += randBetween(0, 1);
      }
      break;

    case 'adulthood':
      // Peak earning years, wisdom accumulates steadily
      // Health begins very slow decline after 40
      changes.wealth += randBetween(0, 2);
      changes.wisdom += randBetween(1, 3);
      changes.socialStanding += randBetween(0, 1);
      changes.spiritualDev += randBetween(0, 1);
      if (age > 40) {
        changes.health += randBetween(-2, 0);
      }
      break;

    case 'elderhood':
      // Health declines, but wisdom and spiritual development peak
      // This is the temple-sleeping phase -- spirituality accelerates
      changes.health += randBetween(-3, -1);
      changes.wisdom += randBetween(2, 4);
      changes.spiritualDev += randBetween(1, 3);
      // Happiness depends on spiritual development
      if (state.stats.spiritualDev > 30) {
        changes.happiness += randBetween(0, 2);
      } else {
        changes.happiness += randBetween(-2, 0);
      }
      // Social standing rises with age in Buddhist cultures
      changes.socialStanding += randBetween(0, 2);
      // Wealth may decline as you give more to the temple
      changes.wealth += randBetween(-2, 0);

      // Steeper health decline past 70
      if (age > 70) {
        changes.health += randBetween(-3, -1);
      }
      // And past 80
      if (age > 80) {
        changes.health += randBetween(-4, -1);
      }
      break;
  }

  return changes;
}

/**
 * Check if the character dies this year.
 * Death probability increases with age and decreases with health.
 * A "good death" (old, meritorious, calm) is the ideal.
 */
export function checkDeath(state) {
  const age = state.character.age;
  const health = state.stats.health;

  // No natural death before 10 (though events could still kill)
  if (age < 10) return false;

  // Very small chance of accidental death in youth (10-30)
  if (age < 30) {
    return Math.random() < 0.001;
  }

  // Small chance in adulthood (30-59)
  if (age < 60) {
    const baseChance = 0.002 + (age - 30) * 0.0005;
    const healthMod = (100 - health) * 0.0003;
    return Math.random() < (baseChance + healthMod);
  }

  // Increasing chance in elderhood
  // Base: 2% at 60, rising ~2% per year, modified by health
  const baseChance = 0.02 + (age - 60) * 0.02;
  const healthMod = (100 - health) * 0.005;
  const totalChance = Math.min(baseChance + healthMod, 0.95);

  // Health at 0 = guaranteed death
  if (health <= 0) return true;

  return Math.random() < totalChance;
}

/**
 * Determine the quality of death based on the character's state.
 * In Buddhist belief, the quality of death profoundly affects rebirth.
 */
export function getDeathQuality(state) {
  const { age } = state.character;
  const { health, wisdom, spiritualDev, happiness } = state.stats;
  const { merit, demerit } = state.karma;
  const stage = getLifeStage(age);

  // A "good death" is old, meritorious, calm, and prepared
  let quality = 0;

  // Age: dying old is much better than dying young
  if (age >= 70) quality += 3;
  else if (age >= 56) quality += 2;
  else if (age >= 30) quality += 0;
  else quality -= 3; // Young death is a tragedy

  // Spiritual development
  if (spiritualDev > 60) quality += 3;
  else if (spiritualDev > 30) quality += 1;
  else quality -= 1;

  // Wisdom
  if (wisdom > 60) quality += 2;
  else if (wisdom > 30) quality += 1;

  // Karma balance
  const net = merit - demerit;
  if (net > 30) quality += 3;
  else if (net > 10) quality += 1;
  else if (net < -10) quality -= 2;
  else if (net < -30) quality -= 4;

  // Emotional state (happiness as proxy for calm acceptance)
  if (happiness > 60) quality += 1;
  else if (happiness < 20) quality -= 2;

  // Sudden vs. expected
  if (stage !== 'elderhood') quality -= 1;

  if (quality >= 7) return 'transcendent';  // Rare: achieved deep peace
  if (quality >= 4) return 'peaceful';       // Good death: old, meritorious, calm
  if (quality >= 1) return 'ordinary';       // Normal death
  if (quality >= -2) return 'troubled';      // Some unresolved karma
  return 'dangerous';                         // Young/violent/burdened death
}

/**
 * Generate a rebirth prognosis based on death quality and karma.
 */
export function getRebirthPrognosis(state) {
  const quality = getDeathQuality(state);
  const { merit, demerit } = state.karma;

  const prognoses = {
    transcendent: {
      text: 'Your spirit rises like incense smoke toward the heavens. Monks will say you achieved what few can -- a death with no wot remaining. Your next life will begin in auspicious circumstances.',
      rebirthQuality: 'excellent',
    },
    peaceful: {
      text: 'You pass gently, surrounded by the merit of a life well-lived. The monks chant and pour water, transferring your accumulated merit. A good rebirth awaits.',
      rebirthQuality: 'good',
    },
    ordinary: {
      text: 'Your death is neither remarkable nor troubled. Some merit, some demerit -- the wheel turns. Your next life will reflect the balance of your actions.',
      rebirthQuality: 'average',
    },
    troubled: {
      text: 'Unresolved karma weighs on your passing. Your khwan are restless, and your family must make extra merit to ease your journey. The path ahead is uncertain.',
      rebirthQuality: 'poor',
    },
    dangerous: {
      text: 'A dangerous death. Your spirit is volatile, caught between worlds. The living must perform special rituals -- song phi to send away your spirit, extra merit-making, perhaps a three-day emergency ordination. Without these, you may linger as a hungry phi.',
      rebirthQuality: 'dire',
    },
  };

  return prognoses[quality] || prognoses.ordinary;
}

/**
 * Get narrative text for a life stage transition.
 */
function getStageTransitionText(newStage, state) {
  const { name, country } = state.character;

  const texts = {
    adolescence: `${name} enters adolescence. The world grows larger and more complex. In ${country === 'thailand' ? 'the Shan highlands' : country}, this is the age when the community begins to expect more.`,
    young_adulthood: `${name} steps into young adulthood. The time for building a household, earning a livelihood, and finding one's place in the web of obligations has arrived.`,
    adulthood: `${name} enters full adulthood. This is the season for demonstrating maturity -- sponsoring ceremonies, leading the community, and accumulating merit in earnest.`,
    elderhood: `${name} crosses into elderhood. The body slows, but the spirit quickens. People begin speaking of temple sleeping, of precepts, of preparing for what comes next.`,
  };

  return texts[newStage] || '';
}

/**
 * Random integer between min and max (inclusive).
 */
function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
