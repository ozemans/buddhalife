import { useState } from 'react';
import StatsPanel from '../game/StatsPanel';
import EventCard from '../game/EventCard';
import AgeAdvance from '../game/AgeAdvance';
import Timeline from '../game/Timeline';
import KarmaVisualizer from '../game/KarmaVisualizer';

const COUNTRY_FLAGS = {
  thailand: '\uD83C\uDDF9\uD83C\uDDED',
  myanmar: '\uD83C\uDDF2\uD83C\uDDF2',
  cambodia: '\uD83C\uDDF0\uD83C\uDDED',
  vietnam: '\uD83C\uDDFB\uD83C\uDDF3',
  laos: '\uD83C\uDDF1\uD83C\uDDE6',
};

const LIFE_STAGES = [
  { max: 0, label: 'Birth' },
  { max: 5, label: 'Infancy' },
  { max: 12, label: 'Childhood' },
  { max: 17, label: 'Adolescence' },
  { max: 29, label: 'Young Adult' },
  { max: 49, label: 'Adult' },
  { max: 64, label: 'Middle Age' },
  { max: 79, label: 'Elder' },
  { max: Infinity, label: 'Venerable' },
];

function getLifeStage(age) {
  return LIFE_STAGES.find((s) => age <= s.max)?.label || 'Elder';
}

export default function GameScreen({
  state,
  onAdvanceYear,
  onMakeChoice,
  onOpenEncyclopedia,
}) {
  const [showSidebar, setShowSidebar] = useState(false);

  const {
    character = {},
    stats = {},
    karma = { merit: 0, demerit: 0, momentum: 0 },
    currentEvent = null,
    lifeEvents = [],
  } = state || {};

  const age = character.age || 0;
  const birthYear = character.birthYear || 2000;
  const year = birthYear + age;
  const lifeStage = getLifeStage(age);
  const countryFlag = COUNTRY_FLAGS[character.country] || '';
  const countryName = character.country
    ? character.country.charAt(0).toUpperCase() + character.country.slice(1)
    : '';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-charcoal-900/95 backdrop-blur-sm border-b border-charcoal-700">
        <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-lg font-serif font-bold text-temple-gold">
              {character.name || 'Unknown'}
            </span>
            <span className="text-xs text-charcoal-400 hidden sm:inline">
              {countryFlag} {countryName}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-charcoal-300">
              <span className="text-saffron-400 font-medium tabular-nums">{age}</span>
              <span className="text-charcoal-500 mx-1">|</span>
              <span className="text-charcoal-400">{lifeStage}</span>
            </span>
            <span className="text-charcoal-500 text-xs tabular-nums">{year}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenEncyclopedia}
              className="p-2 rounded-lg text-charcoal-400 hover:text-temple-gold
                hover:bg-charcoal-800 transition-colors duration-150 cursor-pointer"
              aria-label="Encyclopedia"
              title="Encyclopedia"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                <path d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z" />
              </svg>
            </button>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-lg text-charcoal-400 hover:text-charcoal-100
                hover:bg-charcoal-800 transition-colors duration-150 cursor-pointer md:hidden"
              aria-label="Toggle stats"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex max-w-5xl mx-auto w-full">
        {/* Sidebar - Stats + Karma */}
        <aside
          className={`
            fixed inset-y-0 right-0 z-40 w-72 bg-charcoal-900 border-l border-charcoal-700
            transform transition-transform duration-250 pt-16 px-4 pb-4 overflow-y-auto
            md:relative md:inset-auto md:z-auto md:w-64 md:transform-none md:border-l-0
            md:border-r md:border-charcoal-700 md:pt-4 md:flex-shrink-0
            ${showSidebar ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          `}
        >
          {/* Mobile close */}
          <button
            onClick={() => setShowSidebar(false)}
            className="absolute top-4 right-4 p-1 text-charcoal-400 hover:text-charcoal-100
              md:hidden cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mb-3">
                Stats
              </h3>
              <StatsPanel stats={stats} />
            </div>

            <div className="border-t border-charcoal-700 pt-4">
              <h3 className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mb-3">
                Karma
              </h3>
              <KarmaVisualizer karma={karma} />
            </div>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {showSidebar && (
          <div
            className="fixed inset-0 z-30 bg-charcoal-900/60 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Center content */}
        <main className="flex-1 flex flex-col px-4 py-6 min-w-0">
          <div className="flex-1 flex items-center justify-center">
            {currentEvent ? (
              <EventCard event={currentEvent} onChoice={onMakeChoice} />
            ) : (
              <AgeAdvance
                currentAge={age}
                lifeStage={lifeStage}
                onAdvance={onAdvanceYear}
              />
            )}
          </div>

          {/* Timeline at bottom */}
          {lifeEvents.length > 0 && (
            <div className="mt-6 border-t border-charcoal-700 pt-4">
              <h3 className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mb-3">
                Life Timeline
              </h3>
              <Timeline events={lifeEvents} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
