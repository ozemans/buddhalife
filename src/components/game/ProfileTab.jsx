import backgrounds from '../../content/characters/backgrounds.json';

const BACKGROUND_LABELS = Object.values(backgrounds)
  .flat()
  .reduce((map, bg) => { map[bg.id] = bg.label; return map; }, {});

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

function getAvatarEmoji(age, gender) {
  if (age <= 2) return '\uD83D\uDC76';
  if (age <= 12) return '\uD83E\uDDD2';
  if (age <= 17) return gender === 'female' ? '\uD83D\uDC67' : '\uD83D\uDC66';
  if (age <= 64) return gender === 'female' ? '\uD83D\uDC69' : '\uD83D\uDC68';
  return '\uD83E\uDDD3';
}

function getCountryName(country) {
  if (!country) return '';
  return country.charAt(0).toUpperCase() + country.slice(1);
}

const STAT_LABELS = [
  { key: 'health', emoji: '\u2764\uFE0F', label: 'Health' },
  { key: 'happiness', emoji: '\uD83D\uDE0A', label: 'Happiness' },
  { key: 'wealth', emoji: '\uD83D\uDCB0', label: 'Wealth' },
  { key: 'wisdom', emoji: '\uD83E\uDDE0', label: 'Wisdom' },
  { key: 'socialStanding', emoji: '\uD83D\uDC65', label: 'Social' },
  { key: 'spiritualDev', emoji: '\uD83D\uDE4F', label: 'Spiritual' },
];

export default function ProfileTab({ character = {}, stats = {}, karma = {}, lifeEvents = [] }) {
  const age = character.age || 0;
  const gender = character.gender || 'male';
  const avatar = getAvatarEmoji(age, gender);
  const flag = COUNTRY_FLAGS[character.country] || '';
  const countryName = getCountryName(character.country);
  const lifeStage = getLifeStage(age);
  const karmaScore = Math.round(Math.max(0, Math.min(100, 50 + ((karma.merit || 0) - (karma.demerit || 0)))));

  // Last 3 significant events
  const keyMoments = [...lifeEvents]
    .sort((a, b) => b.age - a.age)
    .slice(0, 3);

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#FFFFFF',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      padding: '24px 16px',
    }}>
      {/* Avatar */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 64, lineHeight: 1 }}>{avatar}</span>
      </div>

      {/* Name */}
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <h2 style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#1D1D1F',
          margin: 0,
          letterSpacing: '-0.02em',
        }}>
          {character.name || 'Unknown'}
        </h2>
      </div>

      {/* Country */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <span style={{ fontSize: 14, color: '#6E6E73' }}>
          {flag} {countryName}
        </span>
      </div>

      {/* Key info */}
      <div style={{
        backgroundColor: '#F5F5F7',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: '#6E6E73' }}>Age</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1D1D1F' }}>{age}</span>
          </div>
          <div style={{ height: 1, backgroundColor: '#E5E5EA' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: '#6E6E73' }}>Life Stage</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1D1D1F' }}>{lifeStage}</span>
          </div>
          <div style={{ height: 1, backgroundColor: '#E5E5EA' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: '#6E6E73' }}>Background</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1D1D1F' }}>
              {BACKGROUND_LABELS[character.background] || character.background || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Brief stats summary */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#6E6E73',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 12,
        }}>
          Stats
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
        }}>
          {STAT_LABELS.map(({ key, emoji, label }) => {
            const value = Math.max(0, Math.min(100, stats[key] ?? 50));
            return (
              <div key={key} style={{
                textAlign: 'center',
                backgroundColor: '#F5F5F7',
                borderRadius: 10,
                padding: '10px 4px',
              }}>
                <div style={{ fontSize: 18, marginBottom: 2 }}>{emoji}</div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#1D1D1F',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {value}
                </div>
                <div style={{ fontSize: 11, color: '#6E6E73' }}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Moments */}
      <div>
        <h3 style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#6E6E73',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 12,
        }}>
          Key Moments
        </h3>
        {keyMoments.length === 0 ? (
          <p style={{ fontSize: 14, color: '#6E6E73' }}>No key moments yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {keyMoments.map((event, index) => {
              const summary = event.title || event.choiceText || 'An event occurred';
              return (
                <div key={event.eventId || index}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 0',
                  }}>
                    <span style={{
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 44,
                      height: 26,
                      backgroundColor: '#F2F2F7',
                      borderRadius: 9999,
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#6E6E73',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      Age {event.age}
                    </span>
                    <span style={{
                      fontSize: 14,
                      color: '#1D1D1F',
                      lineHeight: 1.4,
                    }}>
                      {summary}
                    </span>
                  </div>
                  {index < keyMoments.length - 1 && (
                    <div style={{ height: 1, backgroundColor: '#E5E5EA' }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
