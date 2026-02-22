import Button from '../ui/Button';

const LIFE_STAGES = [
  { max: 0, label: 'Birth' },
  { max: 5, label: 'Infancy' },
  { max: 12, label: 'Childhood' },
  { max: 17, label: 'Adolescence' },
  { max: 29, label: 'Young Adulthood' },
  { max: 49, label: 'Adulthood' },
  { max: 64, label: 'Middle Age' },
  { max: 79, label: 'Elder' },
  { max: Infinity, label: 'Venerable Elder' },
];

function getLifeStageForAge(age) {
  return LIFE_STAGES.find((s) => age <= s.max)?.label || 'Elder';
}

export default function AgeAdvance({ currentAge = 0, lifeStage, onAdvance }) {
  const nextAge = currentAge + 1;
  const currentStageLabel = lifeStage || getLifeStageForAge(currentAge);
  const nextStageLabel = getLifeStageForAge(nextAge);
  const isTransition = currentStageLabel !== nextStageLabel;

  return (
    <div className="w-full max-w-sm mx-auto text-center">
      {/* Age display */}
      <div className="mb-4">
        <span className="text-4xl md:text-5xl font-serif font-bold text-temple-gold">
          {currentAge}
        </span>
        <span className="block mt-1 text-sm text-charcoal-300">
          {currentStageLabel}
        </span>
      </div>

      {/* Transition notice */}
      {isTransition && (
        <div className="mb-4 px-4 py-2 rounded-xl bg-saffron-500/10 border border-saffron-500/20">
          <p className="text-xs text-saffron-300">
            Entering <span className="font-medium text-saffron-400">{nextStageLabel}</span>
          </p>
        </div>
      )}

      {/* Advance button */}
      <Button variant="primary" size="lg" onClick={onAdvance} className="w-full">
        <span className="flex items-center justify-center gap-2">
          <span>Age Up</span>
          <span className="text-sm opacity-75">{currentAge} &rarr; {nextAge}</span>
        </span>
      </Button>
    </div>
  );
}
