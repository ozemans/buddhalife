import festivals from '../content/festivals.json';

const FESTIVAL_CHANCE = 0.3;

/**
 * Check if a festival occurs this year.
 * Filters festivals to those matching the character's country or "shared",
 * then rolls a 30% chance. Returns a festival object or null.
 */
export function checkForFestival(country, age) {
  if (Math.random() >= FESTIVAL_CHANCE) return null;

  const eligible = festivals.filter(
    (f) => f.country === country || f.country === 'shared'
  );
  if (eligible.length === 0) return null;

  return eligible[Math.floor(Math.random() * eligible.length)];
}

/**
 * Convert a festival JSON entry into an event object compatible with EventCard.
 * Adjusts merit by age (children under 13 get half merit).
 */
export function createFestivalEvent(festival, age) {
  const ageMult = age < 13 ? 0.5 : 1;
  const mult = festival.gameEffect.meritMultiplier;

  return {
    id: `festival_${festival.name.toLowerCase().replace(/\s+/g, '_')}`,
    title: festival.name,
    description: festival.description,
    tags: ['festival', 'spiritual'],
    choices: [
      {
        id: 'a',
        text: 'Participate fully and make offerings',
        effects: {
          karma: { merit: Math.round(3 * mult * ageMult), demerit: 0 },
          stats: { happiness: 5, spiritualDev: 3 },
        },
        outcomeText: `You participate wholeheartedly in ${festival.name}. The community spirit lifts your heart.`,
      },
      {
        id: 'b',
        text: 'Attend quietly and observe',
        effects: {
          karma: { merit: Math.round(1 * mult * ageMult), demerit: 0 },
          stats: { happiness: 2, wisdom: 2 },
        },
        outcomeText: `You observe the ${festival.name} celebrations thoughtfully, gaining insight into the tradition.`,
      },
      {
        id: 'c',
        text: 'Skip the festivities this year',
        effects: {
          karma: { merit: 0, demerit: 1 },
          stats: { socialStanding: -2 },
        },
        outcomeText:
          'You stay home while the community celebrates. Some neighbors notice your absence.',
      },
    ],
  };
}
