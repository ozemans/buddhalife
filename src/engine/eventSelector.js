import { karmaInRange } from './karmaEngine.js';

/**
 * Select an appropriate event from the pool based on the current game state.
 * Uses weighted random selection where events matching more criteria get higher weight.
 * Returns null if no events match (triggers a "quiet year").
 */
export function selectEvent(events, state) {
  const available = getAvailableEvents(events, state);

  if (available.length === 0) return null;

  // Calculate weights for each available event
  const weighted = available.map(event => ({
    event,
    weight: calculateWeight(event, state),
  }));

  // Weighted random selection
  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  if (totalWeight === 0) return null;

  let roll = Math.random() * totalWeight;
  for (const { event, weight } of weighted) {
    roll -= weight;
    if (roll <= 0) return event;
  }

  // Fallback (shouldn't reach here, but safety)
  return weighted[weighted.length - 1].event;
}

/**
 * Get all events that could potentially fire for the current state.
 * Filters by hard requirements, then returns the eligible pool.
 */
export function getAvailableEvents(events, state) {
  if (!events || !Array.isArray(events)) return [];

  const seenIds = new Set(state.lifeEvents.map(e => e.eventId));

  return events.filter(event => {
    // Skip already-seen events
    if (seenIds.has(event.id)) return false;

    // Country filter: event must match player's country or be "shared"
    if (event.country && event.country !== 'shared' && event.country !== state.character.country) {
      return false;
    }

    // Life stage filter: event must match current life stage
    if (event.lifeStage && event.lifeStage !== state.lifeStage) {
      return false;
    }

    // Karma range filter (if the event specifies one)
    if (event.karmaRange && !karmaInRange(state.karma, event.karmaRange)) {
      return false;
    }

    // Minimum age filter (some events only make sense after a certain age)
    if (event.minAge !== undefined && state.character.age < event.minAge) {
      return false;
    }

    // Maximum age filter
    if (event.maxAge !== undefined && state.character.age > event.maxAge) {
      return false;
    }

    // Gender filter (some events are gender-specific)
    if (event.gender && event.gender !== state.character.gender) {
      return false;
    }

    // Prerequisite events (must have seen certain events first)
    if (event.requires) {
      const met = event.requires.every(reqId => seenIds.has(reqId));
      if (!met) return false;
    }

    return true;
  });
}

/**
 * Calculate weight for an event based on how well it fits the current state.
 * Higher weight = more likely to be selected.
 */
function calculateWeight(event, state) {
  let weight = 1.0;

  // Country-specific events get a boost over "shared" events
  if (event.country === state.character.country) {
    weight += 2.0;
  } else if (event.country === 'shared') {
    weight += 0.5;
  }

  // Events matching the exact life stage get a significant boost
  if (event.lifeStage === state.lifeStage) {
    weight += 3.0;
  }

  // Karma-relevant events get a boost
  // Events that address the player's current karma state feel more narratively apt
  if (event.karmaRelevance) {
    const level = getApproxKarmaLevel(state.karma);
    if (event.karmaRelevance === level) {
      weight += 2.0;
    }
  }

  // Events with high narrative stakes get a slight boost
  if (event.stakes) {
    weight += 0.5;
  }

  // Background-matching events (if the event references the player's background)
  if (event.background && event.background === state.character.background) {
    weight += 1.5;
  }

  // Slight randomness to prevent perfectly predictable selection
  weight *= (0.8 + Math.random() * 0.4);

  return Math.max(0.1, weight);
}

/**
 * Quick karma level check for weighting (avoids circular import).
 */
function getApproxKarmaLevel(karma) {
  const net = karma.merit - karma.demerit;
  const total = karma.merit + karma.demerit;
  if (total < 5) return 'balanced';
  const ratio = net / total;
  if (ratio > 0.6) return 'pure';
  if (ratio > 0.2) return 'virtuous';
  if (ratio > -0.2) return 'balanced';
  if (ratio > -0.6) return 'troubled';
  return 'burdened';
}
