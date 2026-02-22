import { calculateKarmaChange, getKarmaLevel, getNetKarma } from './karmaEngine.js';

/**
 * Apply a choice's consequences to the game state.
 * Returns a consequences object that the reducer uses to update state.
 *
 * The consequences object shape:
 * {
 *   statChanges: { health, happiness, wealth, wisdom, socialStanding, spiritualDev },
 *   karma: { merit, demerit, momentum, uncertainty },
 *   relationshipChanges: [ { action, name, type, affinity, affinityDelta, description } ],
 *   lifeEventEntry: { eventId, title, choiceText, outcomeText, age, year },
 *   outcomeText: string,
 * }
 */
export function applyChoice(state, choice) {
  // Calculate new karma
  const newKarma = calculateKarmaChange(choice, state.karma);

  // Calculate stat changes from the choice
  const statChanges = calculateStatChanges(choice, state);

  // Process any relationship effects
  const relationshipChanges = processRelationshipEffects(choice, state);

  // Generate narrative outcome text
  const outcomeText = generateOutcomeText(choice, state);

  // Build the life event timeline entry
  const lifeEventEntry = {
    eventId: state.currentEvent?.id || 'unknown',
    title: state.currentEvent?.title || 'A moment in life',
    choiceText: choice.text,
    outcomeText,
    age: state.character.age,
    year: state.year,
    karmaEffect: choice.karmaEffect,
  };

  return {
    statChanges,
    karma: newKarma,
    relationshipChanges,
    lifeEventEntry,
    outcomeText,
  };
}

/**
 * Calculate stat changes from a choice.
 * Uses explicit stat effects if the choice defines them,
 * otherwise infers reasonable changes from the karma effect.
 */
function calculateStatChanges(choice, state) {
  // If the choice explicitly defines stat changes, use those
  if (choice.statChanges) {
    return { ...choice.statChanges };
  }

  // Otherwise, infer from karma effect and context
  const changes = {
    health: 0,
    happiness: 0,
    wealth: 0,
    wisdom: 0,
    socialStanding: 0,
    spiritualDev: 0,
  };

  const effect = choice.karmaEffect || 'neutral';

  switch (effect) {
    case 'positive':
      changes.happiness += randBetween(2, 6);
      changes.socialStanding += randBetween(1, 4);
      changes.wisdom += randBetween(1, 3);
      changes.spiritualDev += randBetween(1, 4);
      // Generous acts often cost money
      if (choiceMentions(choice, ['sponsor', 'offer', 'donate', 'give', 'generous', 'lavish'])) {
        changes.wealth -= randBetween(3, 10);
      }
      // Temple/merit activities boost spiritual dev more
      if (choiceMentions(choice, ['temple', 'merit', 'monk', 'precept', 'ordain', 'meditation'])) {
        changes.spiritualDev += randBetween(2, 5);
      }
      break;

    case 'negative':
      changes.happiness -= randBetween(2, 6);
      changes.socialStanding -= randBetween(2, 5);
      // Breaking precepts or bad acts reduce spiritual dev
      changes.spiritualDev -= randBetween(1, 3);
      // Some negative choices gain wealth (dirty money, gambling)
      if (choiceMentions(choice, ['gamble', 'money', 'accept', 'job', 'dirty', 'steal'])) {
        changes.wealth += randBetween(2, 8);
      }
      // Dangerous choices may risk health
      if (choiceMentions(choice, ['risk', 'danger', 'break', 'fight', 'drink', 'spirit'])) {
        changes.health -= randBetween(2, 8);
      }
      break;

    case 'complex':
      // Complex choices have mixed outcomes -- some good, some bad
      changes.wisdom += randBetween(2, 5); // You always learn from complexity
      changes.happiness += randBetween(-4, 4);
      changes.socialStanding += randBetween(-3, 3);

      // Financial complexity
      if (choiceMentions(choice, ['money', 'debt', 'gamble', 'accept'])) {
        changes.wealth += randBetween(-5, 10);
      }
      // Spiritual complexity
      if (choiceMentions(choice, ['spirit', 'faith', 'religion', 'path'])) {
        changes.spiritualDev += randBetween(-2, 4);
      }
      break;

    case 'neutral':
    default:
      // Small, mild changes
      changes.wisdom += randBetween(0, 2);
      changes.happiness += randBetween(-2, 2);
      break;
  }

  // Apply surprise factor: occasionally, consequences are unexpectedly
  // stronger or weaker (reflecting karma's unpredictability)
  if (Math.random() < 0.15) {
    const surpriseMultiplier = Math.random() < 0.5 ? 1.5 : 0.5;
    for (const key of Object.keys(changes)) {
      changes[key] = Math.round(changes[key] * surpriseMultiplier);
    }
  }

  return changes;
}

/**
 * Process relationship effects from a choice.
 */
function processRelationshipEffects(choice, state) {
  if (choice.relationshipEffects) {
    return choice.relationshipEffects;
  }

  // Infer basic relationship effects from the choice context
  const changes = [];

  // Choices involving community impact social bonds
  if (choiceMentions(choice, ['community', 'village', 'neighbor', 'volunteer'])) {
    // Strengthen a random existing relationship slightly
    if (state.relationships.length > 0) {
      const idx = Math.floor(Math.random() * state.relationships.length);
      changes.push({
        action: 'update',
        name: state.relationships[idx].name,
        affinityDelta: choice.karmaEffect === 'positive' ? 5 : -3,
      });
    }
  }

  // Choices involving family
  if (choiceMentions(choice, ['family', 'parent', 'mother', 'father', 'child', 'son', 'daughter'])) {
    const familyRels = state.relationships.filter(r => r.type === 'family');
    for (const rel of familyRels) {
      changes.push({
        action: 'update',
        name: rel.name,
        affinityDelta: choice.karmaEffect === 'positive'
          ? randBetween(3, 8)
          : choice.karmaEffect === 'negative'
            ? randBetween(-8, -3)
            : randBetween(-2, 2),
      });
    }
  }

  return changes;
}

/**
 * Generate narrative text describing the outcome of a choice.
 * This creates a short, evocative passage about what happened.
 */
export function generateOutcomeText(choice, state) {
  const { name, country, age } = state.character;
  const stage = state.lifeStage;
  const effect = choice.karmaEffect || 'neutral';

  // If the choice has explicit consequences text from the encounter seed, use it
  if (choice.consequences && typeof choice.consequences === 'string') {
    return personalizeText(choice.consequences, state);
  }

  // Otherwise generate based on effect type and context
  const templates = getOutcomeTemplates(effect, stage, country);
  const template = templates[Math.floor(Math.random() * templates.length)];

  return personalizeText(template, state);
}

/**
 * Get outcome text templates based on the type of karmic effect.
 */
function getOutcomeTemplates(effect, stage, country) {
  const positive = [
    'The community takes notice of your generosity. Elders nod approvingly, and your reputation grows like a well-tended garden.',
    'Merit flows from your actions like water poured from a blessed vessel. You feel lighter, as though a burden has been set down.',
    'Your choice echoes the teachings. In the quiet after, something shifts -- a small opening toward wisdom.',
    'The monks speak of your deed during the next wan sin gathering. Your merit accumulates, visible to all who care to see.',
    'A warm feeling settles in your chest. The khwan are steady. You did the right thing.',
  ];

  const negative = [
    'A heaviness follows your decision. The elders say nothing, but their silence speaks volumes.',
    'You feel the weight of demerit accumulating, like mud on the lotus stem. The path ahead grows murkier.',
    'Word travels through the village faster than you expected. Some doors that were open now seem to close.',
    'That night, sleep comes uneasily. The spirits notice when the precepts are broken.',
    'Your khwan feel unsettled, as though something was lost that cannot easily be retrieved.',
  ];

  const complex = [
    'The consequences of your choice ripple outward in ways you cannot fully predict. Some good, some troubling -- such is the nature of karma.',
    'Wisdom comes from navigating complexity. You learn something true about the world, though the lesson is not comfortable.',
    'The village debates your decision. Some praise your courage; others question your judgment. Both have their reasons.',
    'Like the lotus that grows in murky water, something beautiful may yet emerge from this difficult choice. Or perhaps not. Time will tell.',
    'Your action sits at the crossroads of merit and demerit. The monks say even the Buddha could not always see the full reach of karma.',
  ];

  const neutral = [
    'Life continues its ordinary rhythm. Not every moment is a turning point -- some years pass like clouds.',
    'Your choice is practical, neither remarkable nor regrettable. The wheel turns.',
    'A quiet moment. The monastery bells sound in the distance. Tomorrow will bring its own concerns.',
    'Nothing dramatic follows, but perhaps that is its own form of wisdom -- knowing when not to act boldly.',
  ];

  switch (effect) {
    case 'positive': return positive;
    case 'negative': return negative;
    case 'complex': return complex;
    default: return neutral;
  }
}

/**
 * Replace template variables with character-specific details.
 */
function personalizeText(text, state) {
  return text
    .replace(/\{name\}/g, state.character.name)
    .replace(/\{country\}/g, state.character.country)
    .replace(/\{age\}/g, String(state.character.age))
    .replace(/\{stage\}/g, state.lifeStage);
}

/**
 * Check if a choice's text mentions any of the given keywords.
 */
function choiceMentions(choice, keywords) {
  const text = (choice.text || '').toLowerCase();
  return keywords.some(kw => text.includes(kw));
}

/**
 * Random integer between min and max (inclusive).
 */
function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
