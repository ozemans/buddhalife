import { useState, useCallback, useMemo } from 'react';
import { useGameState, SCREENS, ACTIONS } from './engine/gameState.js';
import { selectEvent } from './engine/eventSelector.js';
import { advanceYear, checkDeath, getRebirthPrognosis } from './engine/lifeProgression.js';
import { applyChoice } from './engine/consequences.js';

import TitleScreen from './components/screens/TitleScreen.jsx';
import GameScreen from './components/screens/GameScreen.jsx';
import EndScreen from './components/screens/EndScreen.jsx';
import EncyclopediaScreen from './components/screens/EncyclopediaScreen.jsx';

// Import all event data
import thailandEvents from './content/events/thailand.json';
import myanmarEvents from './content/events/myanmar.json';
import cambodiaEvents from './content/events/cambodia.json';
import vietnamEvents from './content/events/vietnam.json';
import laosEvents from './content/events/laos.json';
import sharedEvents from './content/events/shared.json';

// Import supporting content
import backgrounds from './content/characters/backgrounds.json';
import glossary from './content/glossary.json';

// Combine all events into a single pool
const ALL_EVENTS = [
  ...thailandEvents,
  ...myanmarEvents,
  ...cambodiaEvents,
  ...vietnamEvents,
  ...laosEvents,
  ...sharedEvents,
];

// Event probability by life stage (not every year has an event)
const EVENT_CHANCE = {
  childhood: 0.4,
  adolescence: 0.55,
  young_adulthood: 0.6,
  adulthood: 0.55,
  elderhood: 0.5,
};

/**
 * Adapt an event choice from JSON format to the format the consequences engine expects.
 * Event JSON: { id, text, effects: { karma, stats, relationships }, outcomeText }
 * Engine expects: { text, karmaEffect, statChanges, relationshipEffects, consequences }
 */
function adaptChoice(choice) {
  const effects = choice.effects || {};
  const karma = effects.karma || {};

  // Derive karmaEffect string from merit/demerit values
  let karmaEffect = 'neutral';
  if (karma.merit > 0 && karma.demerit === 0) karmaEffect = 'positive';
  else if (karma.demerit > 0 && karma.merit === 0) karmaEffect = 'negative';
  else if (karma.merit > 0 && karma.demerit > 0) karmaEffect = 'complex';

  // Derive intensity from magnitude
  const maxKarma = Math.max(karma.merit || 0, karma.demerit || 0);
  const karmaIntensity = maxKarma > 0 ? maxKarma / 8 : 1;

  return {
    ...choice,
    karmaEffect,
    karmaIntensity,
    statChanges: effects.stats || null,
    relationshipEffects: effects.relationships || null,
    consequences: choice.outcomeText || null,
  };
}

export default function App() {
  const [state, dispatch] = useGameState();
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);

  // Get country-specific backgrounds for the title screen
  const countryBackgrounds = useMemo(() => {
    if (!backgrounds) return null;
    return backgrounds;
  }, []);

  // Handle starting a new game
  const handleStartGame = useCallback((character) => {
    dispatch({
      type: ACTIONS.START_GAME,
      payload: {
        name: character.name,
        country: character.country,
        background: character.background,
        birthYear: 2000 + Math.floor(Math.random() * 10),
        gender: 'any',
      },
    });
  }, [dispatch]);

  // Handle advancing one year
  const handleAdvanceYear = useCallback(() => {
    // 1. Calculate natural aging changes
    const yearChanges = advanceYear(state);

    // 2. Apply the year advancement
    dispatch({ type: ACTIONS.ADVANCE_YEAR, payload: yearChanges });

    // 3. Check for death
    const nextState = {
      ...state,
      character: { ...state.character, age: state.character.age + 1 },
      stats: {
        health: Math.max(0, Math.min(100, state.stats.health + (yearChanges.statChanges?.health || 0))),
        happiness: Math.max(0, Math.min(100, state.stats.happiness + (yearChanges.statChanges?.happiness || 0))),
        wealth: Math.max(0, Math.min(200, state.stats.wealth + (yearChanges.statChanges?.wealth || 0))),
        wisdom: Math.max(0, Math.min(100, state.stats.wisdom + (yearChanges.statChanges?.wisdom || 0))),
        socialStanding: Math.max(0, Math.min(100, state.stats.socialStanding + (yearChanges.statChanges?.socialStanding || 0))),
        spiritualDev: Math.max(0, Math.min(100, state.stats.spiritualDev + (yearChanges.statChanges?.spiritualDev || 0))),
      },
    };

    if (checkDeath(nextState)) {
      const prognosis = getRebirthPrognosis(nextState);
      dispatch({
        type: ACTIONS.END_LIFE,
        payload: { rebirthPrognosis: prognosis },
      });
      return;
    }

    // 4. Maybe trigger an event
    const stage = yearChanges.newStage || state.lifeStage;
    const eventChance = EVENT_CHANCE[stage] || 0.5;

    if (Math.random() < eventChance) {
      const event = selectEvent(ALL_EVENTS, {
        ...nextState,
        lifeStage: stage,
      });
      if (event) {
        dispatch({ type: ACTIONS.TRIGGER_EVENT, payload: event });
      }
    }
  }, [state, dispatch]);

  // Handle making a choice in an event
  const handleMakeChoice = useCallback((choiceId) => {
    if (!state.currentEvent) return;

    const rawChoice = state.currentEvent.choices.find(c => c.id === choiceId);
    if (!rawChoice) return;

    const adapted = adaptChoice(rawChoice);
    const consequences = applyChoice(state, adapted);

    // Use the event's outcomeText if available, otherwise use generated text
    if (rawChoice.outcomeText && !consequences.outcomeText) {
      consequences.outcomeText = rawChoice.outcomeText;
    }

    dispatch({
      type: ACTIONS.MAKE_CHOICE,
      payload: { choice: adapted, consequences },
    });
  }, [state, dispatch]);

  // Handle restart
  const handleRestart = useCallback(() => {
    dispatch({ type: ACTIONS.RETURN_TO_TITLE });
  }, [dispatch]);

  // Encyclopedia toggle
  const handleOpenEncyclopedia = useCallback(() => {
    setShowEncyclopedia(true);
  }, []);

  const handleCloseEncyclopedia = useCallback(() => {
    setShowEncyclopedia(false);
  }, []);

  // Show encyclopedia overlay if open
  if (showEncyclopedia) {
    return (
      <EncyclopediaScreen
        glossary={glossary}
        onBack={handleCloseEncyclopedia}
      />
    );
  }

  // Route to the correct screen
  switch (state.screen) {
    case SCREENS.TITLE:
      return (
        <TitleScreen
          onStartGame={handleStartGame}
          backgrounds={countryBackgrounds}
        />
      );

    case SCREENS.PLAYING:
    case SCREENS.EVENT:
      return (
        <GameScreen
          state={state}
          onAdvanceYear={handleAdvanceYear}
          onMakeChoice={handleMakeChoice}
          onOpenEncyclopedia={handleOpenEncyclopedia}
        />
      );

    case SCREENS.END_OF_LIFE:
      return (
        <EndScreen
          state={state}
          onRestart={handleRestart}
        />
      );

    default:
      return (
        <TitleScreen
          onStartGame={handleStartGame}
          backgrounds={countryBackgrounds}
        />
      );
  }
}
