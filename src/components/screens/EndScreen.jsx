const COUNTRY_FLAGS = {
  thailand: '\uD83C\uDDF9\uD83C\uDDED',
  myanmar: '\uD83C\uDDF2\uD83C\uDDF2',
  cambodia: '\uD83C\uDDF0\uD83C\uDDED',
  vietnam: '\uD83C\uDDFB\uD83C\uDDF3',
  laos: '\uD83C\uDDF1\uD83C\uDDE6',
};

const EVENT_EMOJIS = {
  spiritual: '🙏',
  financial: '💰',
  relationship: '❤️',
  health: '🏥',
  education: '📚',
  moral: '⚖️',
  festival: '🎉',
  temple: '🏛️',
  family: '👨‍👩‍👧',
  political: '🗳️',
  dharma: '☸️',
};

function getEventEmoji(event) {
  if (event.emoji) return event.emoji;
  if (event.type && EVENT_EMOJIS[event.type]) return EVENT_EMOJIS[event.type];
  return '☸️';
}

function getRebirthTeaser(karmaScore) {
  if (karmaScore >= 80) {
    return {
      text: 'Your accumulated merit radiates like the sun. A most fortunate rebirth awaits — perhaps even a heavenly realm, or a life destined for awakening.',
      emoji: '🌟',
    };
  }
  if (karmaScore >= 60) {
    return {
      text: 'A life of virtue and generosity. Your good karma suggests a fortunate human rebirth, blessed with opportunity and wisdom.',
      emoji: '🪷',
    };
  }
  if (karmaScore >= 40) {
    return {
      text: 'A balanced life, neither burdened by great demerit nor elevated by great merit. The wheel turns, and another chance to grow awaits.',
      emoji: '☸️',
    };
  }
  if (karmaScore >= 20) {
    return {
      text: 'The weight of unskillful actions lingers. Yet even in difficulty, the seed of awakening remains. May the next life bring greater mindfulness.',
      emoji: '🌱',
    };
  }
  return {
    text: 'A life heavy with demerit, far from the path of liberation. But even the most tangled karma can be unwound through sincere effort in lives to come.',
    emoji: '🌑',
  };
}

function KarmaRing({ score, size = 160, strokeWidth = 12 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const dashOffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E5EA"
          strokeWidth={strokeWidth}
        />
        {/* Filled arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E8960C"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      {/* Centered score */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 36, fontWeight: 700, color: '#1D1D1F', lineHeight: 1 }}>
          {Math.round(clampedScore)}
        </span>
        <span style={{ fontSize: 12, color: '#6E6E73', marginTop: 4, fontWeight: 500 }}>
          Karma
        </span>
      </div>
    </div>
  );
}

export default function EndScreen({ state, onRestart }) {
  const {
    character = {},
    karma = { merit: 0, demerit: 0 },
    lifeEvents = [],
  } = state || {};

  const age = character.age || 0;
  const charName = character.name || 'Unknown';
  const countryFlag = COUNTRY_FLAGS[character.country] || '';
  const countryName = character.country
    ? character.country.charAt(0).toUpperCase() + character.country.slice(1)
    : '';

  const meritVal = Math.round(karma.merit || 0);
  const demeritVal = Math.round(karma.demerit || 0);
  const netKarma = meritVal - demeritVal;
  // Normalize to 0-100 scale: net karma of 0 = 50, clamp to 0-100
  const karmaScore = Math.max(0, Math.min(100, 50 + netKarma));

  // Pick highlights: key moments or last N events
  const keyMoments = lifeEvents.filter((e) => e.isKeyMoment || e.significant);
  const highlights = (keyMoments.length >= 3 ? keyMoments : lifeEvents).slice(-5);

  const rebirth = getRebirthTeaser(karmaScore);

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        {/* Header text */}
        <p style={{ fontSize: 14, color: '#6E6E73', marginBottom: 8 }}>The wheel turns...</p>
        <h1 style={styles.ageHeadline}>
          You lived to age {age}
        </h1>
        <p style={{ fontSize: 16, color: '#6E6E73', marginTop: 4, marginBottom: 32 }}>
          {countryFlag} {charName} of {countryName}
        </p>

        {/* Karma Ring */}
        <div style={{ marginBottom: 32 }}>
          <KarmaRing score={karmaScore} />
        </div>

        {/* Stats summary */}
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <span style={{ fontSize: 20 }}>🙏</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#34C759' }}>{meritVal}</span>
            <span style={styles.statLabel}>Merit</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={{ fontSize: 20 }}>💀</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#FF3B30' }}>{demeritVal}</span>
            <span style={styles.statLabel}>Demerit</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={{ fontSize: 20 }}>📜</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#1D1D1F' }}>{lifeEvents.length}</span>
            <span style={styles.statLabel}>Events</span>
          </div>
        </div>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div style={{ width: '100%', marginBottom: 32 }}>
            <h3 style={styles.sectionTitle}>Highlights</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {highlights.map((event, i) => (
                <div key={i} style={styles.highlightCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#E8960C', minWidth: 48, flexShrink: 0 }}>
                      Age {event.age}
                    </span>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{getEventEmoji(event)}</span>
                    <span style={{ fontSize: 15, color: '#1D1D1F', lineHeight: 1.4 }}>
                      {event.title || event.choiceText || 'A moment of significance'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rebirth teaser */}
        <div style={styles.rebirthCard}>
          <span style={{ fontSize: 32, marginBottom: 12, display: 'block' }}>{rebirth.emoji}</span>
          <p style={{ fontSize: 15, color: '#1D1D1F', lineHeight: 1.6, textAlign: 'center', margin: 0 }}>
            {rebirth.text}
          </p>
        </div>

        {/* Play Again */}
        <div style={{ width: '100%', paddingBottom: 32 }}>
          <button
            onClick={onRestart}
            style={styles.primaryButton}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100dvh',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    justifyContent: 'center',
    padding: '0 16px',
  },
  inner: {
    width: '100%',
    maxWidth: 480,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
  },
  ageHeadline: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1D1D1F',
    letterSpacing: '-0.02em',
    margin: 0,
    textAlign: 'center',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    width: '100%',
    padding: '20px 0',
    marginBottom: 32,
    backgroundColor: '#F5F5F7',
    borderRadius: 16,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6E6E73',
    fontWeight: 500,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#D1D1D6',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#6E6E73',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    margin: 0,
    marginBottom: 12,
  },
  highlightCard: {
    padding: '12px 16px',
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    border: '1px solid #E5E5EA',
  },
  rebirthCard: {
    width: '100%',
    padding: '24px 20px',
    backgroundColor: '#F5F5F7',
    borderRadius: 16,
    marginBottom: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    border: 'none',
    backgroundColor: '#E8960C',
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.15s ease-out',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
};
