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

function getAgeEmoji(age) {
  if (age <= 2) return '\uD83D\uDC76';    // baby
  if (age <= 12) return '\uD83E\uDDD2';   // child
  if (age <= 17) return '\uD83D\uDC66';   // teen
  if (age <= 64) return '\uD83D\uDC68';   // adult
  return '\uD83E\uDDD3';                   // elder
}

export default function AgeAdvance({ currentAge = 0, lifeStage, onAdvance }) {
  const nextAge = currentAge + 1;
  const currentStageLabel = lifeStage || getLifeStageForAge(currentAge);
  const nextStageLabel = getLifeStageForAge(nextAge);
  const isTransition = currentStageLabel !== nextStageLabel;
  const avatarEmoji = getAgeEmoji(currentAge);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 400,
        margin: '0 auto',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
      }}
    >
      {/* Avatar emoji (large) */}
      <span style={{ fontSize: 48, lineHeight: 1, marginBottom: 16 }}>
        {avatarEmoji}
      </span>

      {/* Age in large bold text */}
      <div
        style={{
          fontSize: 40,
          fontWeight: 700,
          color: '#1D1D1F',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
        }}
      >
        Age: {currentAge}
      </div>

      {/* Life stage label */}
      <div
        style={{
          fontSize: 16,
          color: '#6E6E73',
          marginTop: 8,
          fontWeight: 400,
        }}
      >
        {currentStageLabel}
      </div>

      {/* Transition notice */}
      {isTransition && (
        <div
          style={{
            marginTop: 16,
            padding: '8px 16px',
            borderRadius: 12,
            backgroundColor: '#FFF8E1',
            fontSize: 14,
            color: '#E8960C',
            fontWeight: 500,
          }}
        >
          Entering {nextStageLabel}
        </div>
      )}

      {/* Quiet year text */}
      <p
        style={{
          fontSize: 14,
          color: '#6E6E73',
          marginTop: 20,
          lineHeight: 1.5,
          fontStyle: 'italic',
        }}
      >
        A quiet year passes...
      </p>

      {/* Age Up button */}
      <button
        onClick={onAdvance}
        style={{
          marginTop: 24,
          width: '100%',
          minHeight: 56,
          padding: '16px 24px',
          borderRadius: 12,
          backgroundColor: '#E8960C',
          border: 'none',
          cursor: 'pointer',
          fontSize: 18,
          fontWeight: 600,
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'transform 150ms ease-out',
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.97)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        onTouchStart={(e) => {
          e.currentTarget.style.transform = 'scale(0.97)';
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        Age Up {'\u25B6'}
      </button>
    </div>
  );
}
