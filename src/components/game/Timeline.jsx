export default function Timeline({ events = [] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-charcoal-400 text-sm italic">
        Your life story has yet to unfold...
      </div>
    );
  }

  const sortedEvents = [...events].sort((a, b) => b.age - a.age);

  return (
    <div className="w-full max-h-64 md:max-h-96 overflow-y-auto pr-1 custom-scrollbar">
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-2 top-1 bottom-1 w-px bg-charcoal-600" />

        <div className="space-y-4">
          {sortedEvents.map((event, index) => (
            <div key={index} className="relative">
              {/* Dot */}
              <div
                className={`absolute -left-4 top-1 w-3 h-3 rounded-full border-2
                  ${index === 0
                    ? 'bg-saffron-500 border-saffron-400 shadow-sm shadow-saffron-500/30'
                    : 'bg-charcoal-700 border-charcoal-500'
                  }`}
              />

              <div className="pb-1">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-xs font-medium text-saffron-400 tabular-nums">
                    Age {event.age}
                  </span>
                  <span className="text-sm font-medium text-charcoal-100">
                    {event.title}
                  </span>
                </div>
                {event.description && (
                  <p className="text-xs text-charcoal-400 leading-relaxed">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
