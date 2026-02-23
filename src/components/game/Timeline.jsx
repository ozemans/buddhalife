export default function Timeline({ events = [] }) {
  if (events.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '48px 16px',
        color: '#6E6E73',
        fontSize: 16,
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        backgroundColor: '#FFFFFF',
      }}>
        Your story begins...
      </div>
    );
  }

  const sortedEvents = [...events].sort((a, b) => b.age - a.age);

  return (
    <div
      className="custom-scrollbar"
      style={{
        width: '100%',
        maxHeight: 480,
        overflowY: 'auto',
        backgroundColor: '#FFFFFF',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {sortedEvents.map((event, index) => {
        const summary = event.choiceText && event.choiceText.length < (event.title?.length || Infinity)
          ? event.choiceText
          : event.title || event.choiceText || 'An event occurred';

        return (
          <div key={event.eventId || index}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
            }}>
              {/* Age badge */}
              <span style={{
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 48,
                height: 28,
                backgroundColor: '#F2F2F7',
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 600,
                color: '#6E6E73',
                padding: '0 10px',
                fontVariantNumeric: 'tabular-nums',
              }}>
                Age {event.age}
              </span>
              {/* Summary text */}
              <span style={{
                fontSize: 15,
                color: '#1D1D1F',
                lineHeight: 1.4,
              }}>
                {summary}
              </span>
            </div>
            {/* Divider — skip after last item */}
            {index < sortedEvents.length - 1 && (
              <div style={{
                height: 1,
                backgroundColor: '#E5E5EA',
                marginLeft: 16,
                marginRight: 16,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
