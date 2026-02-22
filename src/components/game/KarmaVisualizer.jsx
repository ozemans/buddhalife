const LOTUS_STAGES = [
  { min: -Infinity, max: -20, label: 'Seed', symbol: '\u{1F331}', description: 'A dormant seed in murky waters, awaiting the light of compassion.' },
  { min: -20, max: 10, label: 'Sprout', symbol: '\u{1FAB4}', description: 'A tender sprout reaches upward through the mud, seeking clarity.' },
  { min: 10, max: 40, label: 'Bud', symbol: '\u{1F33C}', description: 'A lotus bud forms, holding the promise of wisdom within.' },
  { min: 40, max: 70, label: 'Bloom', symbol: '\u{1F33B}', description: 'The lotus opens its petals, radiating merit into the world.' },
  { min: 70, max: Infinity, label: 'Full Bloom', symbol: '\u{1F338}', description: 'A fully blossomed lotus, luminous with accumulated merit and virtue.' },
];

function getNetKarma(karma) {
  return (karma.merit || 0) - (karma.demerit || 0);
}

function getStage(netKarma) {
  return LOTUS_STAGES.find((s) => netKarma >= s.min && netKarma < s.max) || LOTUS_STAGES[0];
}

function getMomentumLabel(momentum) {
  if (momentum > 5) return 'Rising';
  if (momentum < -5) return 'Falling';
  return 'Steady';
}

function getMomentumColor(momentum) {
  if (momentum > 5) return 'text-forest-400';
  if (momentum < -5) return 'text-red-400';
  return 'text-charcoal-300';
}

export default function KarmaVisualizer({ karma = { merit: 0, demerit: 0, momentum: 0 } }) {
  const netKarma = getNetKarma(karma);
  const stage = getStage(netKarma);
  const merit = karma.merit || 0;
  const demerit = karma.demerit || 0;
  const total = merit + demerit || 1;
  const momentum = karma.momentum || 0;

  return (
    <div className="w-full max-w-sm mx-auto text-center">
      {/* Lotus display */}
      <div className="relative mb-4">
        <div
          className="mx-auto w-24 h-24 flex items-center justify-center
            rounded-full bg-charcoal-800 border-2 border-temple-gold/30
            shadow-lg shadow-temple-gold/10"
        >
          <span className="text-5xl select-none" role="img" aria-label={stage.label}>
            {stage.symbol}
          </span>
        </div>
        <p className="mt-3 text-sm font-serif font-semibold text-temple-gold">
          {stage.label}
        </p>
      </div>

      {/* Merit / Demerit bar */}
      <div className="mb-4 px-2">
        <div className="flex items-center justify-between mb-1.5 text-xs text-charcoal-300">
          <span>Merit: {merit}</span>
          <span>Demerit: {demerit}</span>
        </div>
        <div className="h-3 rounded-full bg-charcoal-700 overflow-hidden flex">
          <div
            className="h-full bg-forest-400 transition-all duration-500 ease-out"
            style={{ width: `${(merit / total) * 100}%` }}
          />
          <div
            className="h-full bg-red-400 transition-all duration-500 ease-out"
            style={{ width: `${(demerit / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Momentum */}
      <div className="mb-4">
        <span className="text-xs text-charcoal-400">Momentum: </span>
        <span className={`text-xs font-medium ${getMomentumColor(momentum)}`}>
          {getMomentumLabel(momentum)}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed text-charcoal-300 italic font-serif px-4">
        {stage.description}
      </p>
    </div>
  );
}
