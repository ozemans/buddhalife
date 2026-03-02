import { useReducer } from 'react';
import { getLifeStage } from './lifeProgression.js';

// Screen states
export const SCREENS = {
  TITLE: 'TITLE',
  CHARACTER_CREATE: 'CHARACTER_CREATE',
  PLAYING: 'PLAYING',
  EVENT: 'EVENT',
  END_OF_LIFE: 'END_OF_LIFE',
};

// Action types
export const ACTIONS = {
  START_GAME: 'START_GAME',
  ADVANCE_YEAR: 'ADVANCE_YEAR',
  TRIGGER_EVENT: 'TRIGGER_EVENT',
  MAKE_CHOICE: 'MAKE_CHOICE',
  END_LIFE: 'END_LIFE',
  GO_TO_CREATE: 'GO_TO_CREATE',
  RETURN_TO_TITLE: 'RETURN_TO_TITLE',
  DISMISS_EVENT: 'DISMISS_EVENT',
  RESTORE_SAVE: 'RESTORE_SAVE',
  SET_RELATIONSHIPS: 'SET_RELATIONSHIPS',
};

const initialState = {
  screen: SCREENS.TITLE,
  character: {
    name: '',
    country: '',
    background: '',
    birthYear: 0,
    gender: '',
    age: 0,
  },
  stats: {
    health: 100,
    happiness: 50,
    wealth: 50,
    wisdom: 0,
    socialStanding: 50,
    spiritualDev: 0,
  },
  karma: {
    merit: 0,
    demerit: 0,
    momentum: 0,       // positive = trending virtuous, negative = trending troubled
    uncertainty: Math.random() * 0.2,
  },
  relationships: [],
  lifeEvents: [],       // timeline of past events
  currentEvent: null,
  year: 0,
  lifeStage: 'childhood',
};

function gameReducer(state, action) {
  switch (action.type) {

    case ACTIONS.GO_TO_CREATE:
      return {
        ...initialState,
        screen: SCREENS.CHARACTER_CREATE,
        karma: { ...initialState.karma, uncertainty: Math.random() * 0.2 },
      };

    case ACTIONS.START_GAME: {
      const { name, country, background, birthYear, gender } = action.payload;
      return {
        ...initialState,
        screen: SCREENS.PLAYING,
        character: { name, country, background, birthYear, gender, age: 0 },
        stats: { ...initialState.stats },
        karma: {
          merit: 0,
          demerit: 0,
          momentum: 0,
          uncertainty: Math.random() * 0.2,
        },
        relationships: [],
        lifeEvents: [],
        currentEvent: null,
        year: 0,
        lifeStage: 'childhood',
      };
    }

    case ACTIONS.ADVANCE_YEAR: {
      // action.payload contains the changes computed by lifeProgression.advanceYear
      const changes = action.payload;
      const newAge = state.character.age + 1;
      const newLifeStage = getLifeStage(newAge);

      return {
        ...state,
        character: {
          ...state.character,
          age: newAge,
        },
        stats: {
          health: clamp(state.stats.health + (changes.statChanges?.health || 0), 0, 100),
          happiness: clamp(state.stats.happiness + (changes.statChanges?.happiness || 0), 0, 100),
          wealth: clamp(state.stats.wealth + (changes.statChanges?.wealth || 0), 0, 200),
          wisdom: clamp(state.stats.wisdom + (changes.statChanges?.wisdom || 0), 0, 100),
          socialStanding: clamp(state.stats.socialStanding + (changes.statChanges?.socialStanding || 0), 0, 100),
          spiritualDev: clamp(state.stats.spiritualDev + (changes.statChanges?.spiritualDev || 0), 0, 100),
        },
        year: state.year + 1,
        lifeStage: newLifeStage,
      };
    }

    case ACTIONS.TRIGGER_EVENT: {
      // action.payload is the event object selected by eventSelector
      return {
        ...state,
        screen: SCREENS.EVENT,
        currentEvent: action.payload,
      };
    }

    case ACTIONS.MAKE_CHOICE: {
      // action.payload contains { choice, consequences }
      // consequences is the result from consequences.applyChoice
      const { consequences } = action.payload;

      const newStats = { ...state.stats };
      if (consequences.statChanges) {
        for (const [key, val] of Object.entries(consequences.statChanges)) {
          if (key in newStats) {
            const max = key === 'wealth' ? 200 : 100;
            newStats[key] = clamp(newStats[key] + val, 0, max);
          }
        }
      }

      const newKarma = consequences.karma
        ? { ...consequences.karma }
        : state.karma;

      const newRelationships = consequences.relationshipChanges
        ? applyRelationshipChanges(state.relationships, consequences.relationshipChanges)
        : state.relationships;

      const newLifeEvents = consequences.lifeEventEntry
        ? [...state.lifeEvents, consequences.lifeEventEntry]
        : state.lifeEvents;

      return {
        ...state,
        screen: SCREENS.PLAYING,
        stats: newStats,
        karma: newKarma,
        relationships: newRelationships,
        lifeEvents: newLifeEvents,
        currentEvent: null,
      };
    }

    case ACTIONS.DISMISS_EVENT:
      return {
        ...state,
        screen: SCREENS.PLAYING,
        currentEvent: null,
      };

    case ACTIONS.END_LIFE: {
      // action.payload may include endOfLifeSummary
      return {
        ...state,
        screen: SCREENS.END_OF_LIFE,
        currentEvent: null,
        ...(action.payload || {}),
      };
    }

    case ACTIONS.RETURN_TO_TITLE:
      return {
        ...initialState,
        karma: { ...initialState.karma, uncertainty: Math.random() * 0.2 },
      };

    case ACTIONS.RESTORE_SAVE:
      // Replace entire state with saved data
      return { ...action.payload };

    case ACTIONS.SET_RELATIONSHIPS:
      return { ...state, relationships: action.payload };

    default:
      return state;
  }
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function applyRelationshipChanges(relationships, changes) {
  const updated = [...relationships];

  for (const change of changes) {
    if (change.action === 'add') {
      updated.push({
        name: change.name,
        type: change.type,         // 'family', 'friend', 'mentor', 'rival', etc.
        affinity: change.affinity || 50,
        description: change.description || '',
      });
    } else if (change.action === 'update') {
      const idx = updated.findIndex(r => r.name === change.name);
      if (idx !== -1) {
        updated[idx] = {
          ...updated[idx],
          affinity: clamp((updated[idx].affinity || 50) + (change.affinityDelta || 0), 0, 100),
          ...(change.description ? { description: change.description } : {}),
        };
      }
    } else if (change.action === 'remove') {
      const idx = updated.findIndex(r => r.name === change.name);
      if (idx !== -1) updated.splice(idx, 1);
    }
  }

  return updated;
}

// --- localStorage persistence ---

const SAVE_KEY = 'samsara_save';

export function saveGame(state) {
  if (state.screen !== SCREENS.PLAYING && state.screen !== SCREENS.EVENT) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (_) {
    // silently ignore quota errors or unavailable localStorage
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Basic validity check: must have a screen and character object
    if (!parsed || !parsed.screen || !parsed.character) return null;
    return parsed;
  } catch (_) {
    return null;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (_) {
    // ignore
  }
}

export function hasSave() {
  try {
    return localStorage.getItem(SAVE_KEY) !== null;
  } catch (_) {
    return false;
  }
}

// --- Hook ---

export function useGameState(initialOverride) {
  const init = initialOverride || {
    ...initialState,
    karma: { ...initialState.karma, uncertainty: Math.random() * 0.2 },
  };
  const [state, dispatch] = useReducer(gameReducer, init);
  return [state, dispatch];
}

export { initialState };
