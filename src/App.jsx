import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useGameState, SCREENS, ACTIONS, saveGame, loadGame, clearSave, hasSave } from './engine/gameState.js';
import { selectEvent } from './engine/eventSelector.js';
import { advanceYear, checkDeath, getRebirthPrognosis } from './engine/lifeProgression.js';
import { applyChoice } from './engine/consequences.js';
import { checkForFestival, createFestivalEvent } from './engine/festivalEngine.js';
import { generateStartingNPCs, ageNPCs } from './engine/npcEngine.js';
import { initAudio, playBell, playChime, playMeritSound, playDemeritSound, isMuted } from './engine/audioEngine.js';

import TitleScreen from './components/screens/TitleScreen.jsx';
import GameScreen from './components/screens/GameScreen.jsx';
import EndScreen from './components/screens/EndScreen.jsx';
import EncyclopediaScreen from './components/screens/EncyclopediaScreen.jsx';
import ScreenTransition from './components/ui/ScreenTransition.jsx';

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
  const [savedGameExists, setSavedGameExists] = useState(() => hasSave());
  const prevScreenRef = useRef(state.screen);

  // Auto-save whenever state changes while PLAYING or EVENT
  useEffect(() => {
    if (state.screen === SCREENS.PLAYING || state.screen === SCREENS.EVENT) {
      saveGame(state);
      setSavedGameExists(true);
    }
  }, [state]);

  // Clear save when transitioning INTO end-of-life or title (not on initial mount)
  useEffect(() => {
    const prev = prevScreenRef.current;
    prevScreenRef.current = state.screen;
    if (prev === state.screen) return;
    if (state.screen === SCREENS.END_OF_LIFE || state.screen === SCREENS.TITLE) {
      clearSave();
      setSavedGameExists(false);
    }
  }, [state.screen]);

  // Get country-specific backgrounds for the title screen
  const countryBackgrounds = useMemo(() => {
    if (!backgrounds) return null;
    return backgrounds;
  }, []);

  // Handle starting a new game
  const handleStartGame = useCallback((character) => {
    initAudio();
    dispatch({
      type: ACTIONS.START_GAME,
      payload: {
        name: character.name,
        country: character.country,
        background: character.background,
        birthYear: 2000 + Math.floor(Math.random() * 10),
        gender: character.gender || 'any',
      },
    });

    // Generate starting NPCs and set them as relationships
    const startingNPCs = generateStartingNPCs(character.country, character.background);
    dispatch({ type: ACTIONS.SET_RELATIONSHIPS, payload: startingNPCs });
  }, [dispatch]);

  // Handle advancing one year
  const handleAdvanceYear = useCallback(() => {
    // 1. Calculate natural aging changes
    const yearChanges = advanceYear(state);

    // 2. Apply the year advancement
    dispatch({ type: ACTIONS.ADVANCE_YEAR, payload: yearChanges });

    // Ambient bell on each year advance
    if (!isMuted()) playBell();

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

    // 3b. Age NPCs — check for deaths
    const { relationships: agedRelationships, deathNotification } = ageNPCs(
      state.relationships,
      nextState.character.age
    );
    if (agedRelationships !== state.relationships) {
      dispatch({ type: ACTIONS.SET_RELATIONSHIPS, payload: agedRelationships });
    }
    if (deathNotification) {
      dispatch({
        type: ACTIONS.TRIGGER_EVENT,
        payload: {
          id: `npc_death_${Date.now()}`,
          title: 'A Loss in the Family',
          description: deathNotification,
          tags: ['family', 'death', 'funeral'],
          choices: [
            {
              id: 'a',
              text: 'Attend the funeral and make merit offerings',
              effects: {
                karma: { merit: 3, demerit: 0 },
                stats: { happiness: -5, spiritualDev: 3 },
              },
              outcomeText: 'You honor their memory with prayers and offerings. The merit made brings some comfort.',
            },
            {
              id: 'b',
              text: 'Grieve quietly and reflect on impermanence',
              effects: {
                karma: { merit: 1, demerit: 0 },
                stats: { happiness: -3, wisdom: 4 },
              },
              outcomeText: 'In your grief, you contemplate the Buddha\'s teaching on anicca — all things are impermanent.',
            },
            {
              id: 'c',
              text: 'Make a scene at the funeral and air your grievances',
              effects: {
                karma: { merit: 0, demerit: 8 },
                stats: { happiness: -8, spiritualDev: -5, socialStanding: -10 },
                relationships: [{ target: 'family', change: -15 }, { target: 'community', change: -10 }],
              },
              outcomeText: 'You erupt in front of everyone — old arguments, unresolved anger, all of it spilling out over the coffin. The monks stop chanting. Your mother covers her face. The village will talk about this for years.',
            },
            {
              id: 'd',
              text: 'Pocket some of the funeral donation money',
              effects: {
                karma: { merit: 0, demerit: 6 },
                stats: { happiness: -4, spiritualDev: -3, socialStanding: -8, wealth: 5 },
                relationships: [{ target: 'family', change: -10 }, { target: 'monks', change: -5 }],
              },
              outcomeText: 'While the family is distracted with grief, you slip some of the donation envelopes into your pocket. The money feels heavy. That night, you dream of the deceased watching you with sad, knowing eyes.',
            },
          ],
        },
      });
      return; // Death event takes priority this year
    }

    // 4. Check for festival event
    const festival = checkForFestival(state.character.country, nextState.character.age);
    if (festival) {
      const festivalEvent = createFestivalEvent(festival, nextState.character.age);
      dispatch({ type: ACTIONS.TRIGGER_EVENT, payload: festivalEvent });
      return; // Festival takes priority this year
    }

    // 5. Maybe trigger a regular event
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

    // Audio cues for choices
    if (!isMuted()) {
      playChime();
      if (adapted.karmaEffect === 'positive') {
        setTimeout(playMeritSound, 300);
      } else if (adapted.karmaEffect === 'negative') {
        setTimeout(playDemeritSound, 300);
      }
    }
  }, [state, dispatch]);

  // Handle continuing from a saved game
  const handleContinue = useCallback(() => {
    const saved = loadGame();
    if (saved) {
      dispatch({ type: ACTIONS.RESTORE_SAVE, payload: saved });
    }
  }, [dispatch]);

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
      <ScreenTransition screenKey="encyclopedia">
        <EncyclopediaScreen
          glossary={glossary}
          onBack={handleCloseEncyclopedia}
        />
      </ScreenTransition>
    );
  }

  // Determine which screen to render
  const screenKey = state.screen === SCREENS.PLAYING || state.screen === SCREENS.EVENT
    ? 'game'
    : state.screen;

  let screenContent;
  switch (state.screen) {
    case SCREENS.PLAYING:
    case SCREENS.EVENT:
      screenContent = (
        <GameScreen
          state={state}
          onAdvanceYear={handleAdvanceYear}
          onMakeChoice={handleMakeChoice}
          onOpenEncyclopedia={handleOpenEncyclopedia}
        />
      );
      break;

    case SCREENS.END_OF_LIFE:
      screenContent = (
        <EndScreen
          state={state}
          onRestart={handleRestart}
        />
      );
      break;

    case SCREENS.TITLE:
    default:
      screenContent = (
        <TitleScreen
          onStartGame={handleStartGame}
          backgrounds={countryBackgrounds}
          hasSavedGame={savedGameExists}
          onContinue={handleContinue}
        />
      );
      break;
  }

  return (
    <ScreenTransition screenKey={screenKey}>
      {screenContent}
    </ScreenTransition>
  );
}
