const KARMA_LEVELS = [
  { min: 0, max: 20, label: 'Unwholesome', description: 'Your actions carry heavy karmic weight. The path to merit begins with a single mindful step.' },
  { min: 20, max: 40, label: 'Struggling', description: 'Seeds of merit are planted but have yet to take root. Continue cultivating good intentions.' },
  { min: 40, max: 60, label: 'Balanced', description: 'Your karma is in equilibrium. Each choice tips the scales toward light or shadow.' },
  { min: 60, max: 80, label: 'Meritorious', description: 'Your accumulated merit shines through your actions. Others take notice of your virtue.' },
  { min: 80, max: 101, label: 'Radiant', description: 'A life of profound merit. Your karma illuminates the path for those around you.' },
];

function getKarmaLevel(score) {
  return KARMA_LEVELS.find((l) => score >= l.min && score < l.max) || KARMA_LEVELS[2];
}

function getMomentumDisplay(momentum) {
  if (momentum > 0.1) return { text: 'Rising', arrow: '\u2191', color: '#34C759' };
  if (momentum < -0.1) return { text: 'Falling', arrow: '\u2193', color: '#FF3B30' };
  return { text: 'Steady', arrow: '\u2192', color: '#6E6E73' };
}

export default function KarmaVisualizer({ karma = { merit: 0, demerit: 0, momentum: 0, uncertainty: 0 } }) {
  const merit = karma.merit || 0;
  const demerit = karma.demerit || 0;
  const momentum = karma.momentum || 0;

  const score = Math.round(Math.max(0, Math.min(100, 50 + (merit - demerit))));
  const level = getKarmaLevel(score);
  const momentumDisplay = getMomentumDisplay(momentum);

  // SVG circle math
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fillPercent = score / 100;
  const dashoffset = circumference * (1 - fillPercent);

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 16px',
      backgroundColor: '#FFFFFF',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Circular progress ring */}
      <div style={{ position: 'relative', width: size, height: size, marginBottom: 16 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E5EA"
            strokeWidth={strokeWidth}
          />
          {/* Fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E8960C"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            style={{
              transition: 'stroke-dashoffset 0.8s ease-out',
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
            }}
          />
        </svg>
        {/* Score centered inside */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontSize: 36,
            fontWeight: 700,
            color: '#1D1D1F',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}>
            {score}
          </span>
        </div>
      </div>

      {/* Merit / Demerit line */}
      <p style={{
        fontSize: 14,
        color: '#6E6E73',
        marginBottom: 8,
        lineHeight: 1.5,
      }}>
        Merit: {Math.round(merit)} | Demerit: {Math.round(demerit)}
      </p>

      {/* Momentum indicator */}
      <p style={{
        fontSize: 14,
        fontWeight: 600,
        color: momentumDisplay.color,
        marginBottom: 12,
        lineHeight: 1.5,
      }}>
        {momentumDisplay.text} {momentumDisplay.arrow}
      </p>

      {/* Karma level description */}
      <p style={{
        fontSize: 14,
        color: '#6E6E73',
        textAlign: 'center',
        lineHeight: 1.6,
        maxWidth: 280,
      }}>
        {level.description}
      </p>
    </div>
  );
}
