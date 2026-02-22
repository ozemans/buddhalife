import { useState } from 'react';

const STAT_CONFIG = [
  { key: 'health', label: 'Health', icon: '\u2764' },
  { key: 'happiness', label: 'Happiness', icon: '\u263A' },
  { key: 'wealth', label: 'Wealth', icon: '\u2B50' },
  { key: 'wisdom', label: 'Wisdom', icon: '\u{1F4D6}' },
  { key: 'socialStanding', label: 'Social Standing', icon: '\u{1F465}' },
  { key: 'spiritualDevelopment', label: 'Spiritual', icon: '\u2638' },
];

function getBarColor(value) {
  if (value >= 70) return 'bg-forest-400';
  if (value >= 40) return 'bg-saffron-500';
  return 'bg-red-500';
}

function getBarTrack(value) {
  if (value >= 70) return 'bg-forest-400/15';
  if (value >= 40) return 'bg-saffron-500/15';
  return 'bg-red-500/15';
}

export default function StatsPanel({ stats = {} }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="w-full">
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full md:hidden
          px-4 py-3 bg-charcoal-800 border border-charcoal-600 rounded-xl
          text-charcoal-200 text-sm font-medium cursor-pointer
          hover:bg-charcoal-700 transition-colors duration-150"
      >
        <span>Stats</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`
          mt-2 md:mt-0 space-y-3
          transition-all duration-250 overflow-hidden
          ${collapsed ? 'max-h-0 opacity-0 md:max-h-none md:opacity-100' : 'max-h-96 opacity-100'}
        `}
      >
        {STAT_CONFIG.map(({ key, label, icon }) => {
          const value = stats[key] ?? 50;
          const clampedValue = Math.max(0, Math.min(100, value));

          return (
            <div key={key} className="px-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-charcoal-300">
                  <span className="mr-1.5">{icon}</span>
                  {label}
                </span>
                <span className="text-xs font-medium text-charcoal-200 tabular-nums">
                  {clampedValue}
                </span>
              </div>
              <div className={`h-2 rounded-full ${getBarTrack(clampedValue)}`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${getBarColor(clampedValue)}`}
                  style={{ width: `${clampedValue}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
