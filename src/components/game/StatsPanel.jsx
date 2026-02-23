const STAT_CONFIG = [
  { key: 'health', label: 'Health', emoji: '\u2764\uFE0F', color: '#FF3B30' },
  { key: 'happiness', label: 'Happiness', emoji: '\uD83D\uDE0A', color: '#FFCC00' },
  { key: 'wealth', label: 'Wealth', emoji: '\uD83D\uDCB0', color: '#34C759' },
  { key: 'wisdom', label: 'Wisdom', emoji: '\uD83E\uDDE0', color: '#007AFF' },
  { key: 'socialStanding', label: 'Social', emoji: '\uD83D\uDC65', color: '#AF52DE' },
  { key: 'spiritualDev', label: 'Spiritual', emoji: '\uD83D\uDE4F', color: '#E8960C' },
];

export default function StatsPanel({ stats = {} }) {
  return (
    <div style={{
      width: '100%',
      backgroundColor: '#FFFFFF',
      padding: '16px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {STAT_CONFIG.map(({ key, label, emoji, color }) => {
          const value = Math.max(0, Math.min(100, stats[key] ?? 50));

          return (
            <div key={key}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 6,
              }}>
                <span style={{
                  fontSize: 14,
                  color: '#1D1D1F',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <span style={{ fontSize: 18 }}>{emoji}</span>
                  {label}
                </span>
                <span style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1D1D1F',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {value}
                </span>
              </div>
              {/* Progress bar track */}
              <div style={{
                width: '100%',
                height: 8,
                backgroundColor: '#E5E5EA',
                borderRadius: 9999,
                overflow: 'hidden',
              }}>
                {/* Progress bar fill */}
                <div style={{
                  width: `${value}%`,
                  height: '100%',
                  backgroundColor: color,
                  borderRadius: 9999,
                  transition: 'width 0.5s ease-out',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
