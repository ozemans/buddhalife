import Button from '../ui/Button';
import KarmaVisualizer from '../game/KarmaVisualizer';

const COUNTRY_FLAGS = {
  thailand: '\uD83C\uDDF9\uD83C\uDDED',
  myanmar: '\uD83C\uDDF2\uD83C\uDDF2',
  cambodia: '\uD83C\uDDF0\uD83C\uDDED',
  vietnam: '\uD83C\uDDFB\uD83C\uDDF3',
  laos: '\uD83C\uDDF1\uD83C\uDDE6',
};

function getKarmicAssessment(karma) {
  const net = (karma.merit || 0) - (karma.demerit || 0);
  if (net >= 60) {
    return 'A life of extraordinary virtue. The merit accumulated in this existence shall ripple through countless lifetimes, drawing the soul ever closer to liberation.';
  }
  if (net >= 30) {
    return 'A life well lived, with more kindness given than harm caused. The seeds of good karma planted here will bloom in lives to come.';
  }
  if (net >= 0) {
    return 'A balanced life, neither burdened by great demerit nor elevated by great merit. The wheel turns, and another chance to grow awaits.';
  }
  if (net >= -30) {
    return 'The weight of unskillful actions presses upon the soul. Yet even in darkness, the potential for awakening remains. May the next life bring greater wisdom.';
  }
  return 'A life heavy with demerit, far from the path of liberation. But even the most tangled karma can be unwound through sincere effort in lives to come.';
}

export default function EndScreen({ state, onRestart }) {
  const {
    character = {},
    age = 0,
    karma = { merit: 0, demerit: 0, momentum: 0 },
    timeline = [],
  } = state || {};

  const countryFlag = COUNTRY_FLAGS[character.country] || '';
  const countryName = character.country
    ? character.country.charAt(0).toUpperCase() + character.country.slice(1)
    : 'Unknown';

  const keyMoments = timeline
    .filter((e) => e.isKeyMoment || e.significant)
    .slice(0, 6);

  const displayMoments = keyMoments.length > 0 ? keyMoments : timeline.slice(-6);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8 md:py-16">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-sm text-charcoal-400 mb-2 font-serif italic">The wheel turns...</p>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-temple-gold mb-2">
          Life Complete
        </h1>
        <div className="mt-3 mx-auto w-20 h-px bg-gradient-to-r from-transparent via-temple-gold/50 to-transparent" />
      </div>

      {/* Summary card */}
      <div className="w-full max-w-md bg-charcoal-800 border border-charcoal-600 rounded-2xl p-6 mb-8">
        <div className="text-center mb-6">
          <p className="text-lg font-serif text-charcoal-100 mb-1">{character.name || 'Unknown'}</p>
          <p className="text-sm text-charcoal-400">
            {countryFlag} {countryName}
          </p>
        </div>

        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <span className="block text-3xl font-serif font-bold text-saffron-400">{age}</span>
            <span className="block text-xs text-charcoal-400 mt-1">Years Lived</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-serif font-bold text-forest-400">
              {karma.merit || 0}
            </span>
            <span className="block text-xs text-charcoal-400 mt-1">Merit</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-serif font-bold text-red-400">
              {karma.demerit || 0}
            </span>
            <span className="block text-xs text-charcoal-400 mt-1">Demerit</span>
          </div>
        </div>

        {/* Karma lotus */}
        <div className="border-t border-charcoal-700 pt-5">
          <KarmaVisualizer karma={karma} />
        </div>
      </div>

      {/* Key moments */}
      {displayMoments.length > 0 && (
        <div className="w-full max-w-md mb-8">
          <h3 className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mb-4 text-center">
            Key Moments
          </h3>
          <div className="space-y-3">
            {displayMoments.map((event, index) => (
              <div
                key={index}
                className="flex items-start gap-3 px-4 py-3 bg-charcoal-800 border border-charcoal-700 rounded-xl"
              >
                <span className="text-xs font-medium text-saffron-400 tabular-nums flex-shrink-0 mt-0.5">
                  Age {event.age}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-charcoal-100">{event.title}</p>
                  {event.description && (
                    <p className="text-xs text-charcoal-400 mt-0.5">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Karmic assessment */}
      <div className="w-full max-w-md mb-10 px-6 py-5 bg-charcoal-800/50 border border-charcoal-700 rounded-2xl">
        <h3 className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mb-3 text-center">
          Karmic Assessment
        </h3>
        <p className="text-sm leading-relaxed text-charcoal-200 font-serif italic text-center">
          {getKarmicAssessment(karma)}
        </p>
      </div>

      {/* Restart */}
      <div className="w-full max-w-md">
        <Button variant="primary" size="lg" onClick={onRestart} className="w-full text-lg">
          Live Again
        </Button>
      </div>
    </div>
  );
}
