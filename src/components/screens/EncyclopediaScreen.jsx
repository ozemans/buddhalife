import { useState, useMemo } from 'react';
import Button from '../ui/Button';

const COUNTRY_LABELS = {
  all: 'All',
  thailand: '\uD83C\uDDF9\uD83C\uDDED Thailand',
  myanmar: '\uD83C\uDDF2\uD83C\uDDF2 Myanmar',
  cambodia: '\uD83C\uDDF0\uD83C\uDDED Cambodia',
  vietnam: '\uD83C\uDDFB\uD83C\uDDF3 Vietnam',
  laos: '\uD83C\uDDF1\uD83C\uDDE6 Laos',
  general: 'General',
};

export default function EncyclopediaScreen({ glossary = [], onBack }) {
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [expandedTerm, setExpandedTerm] = useState(null);

  const availableCountries = useMemo(() => {
    const countries = new Set(glossary.map((g) => g.country || 'general'));
    return ['all', ...countries];
  }, [glossary]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return glossary.filter((entry) => {
      const matchesCountry =
        countryFilter === 'all' || (entry.country || 'general') === countryFilter;
      if (!matchesCountry) return false;
      if (!query) return true;
      return (
        entry.term?.toLowerCase().includes(query) ||
        entry.pali?.toLowerCase().includes(query) ||
        entry.translation?.toLowerCase().includes(query) ||
        entry.description?.toLowerCase().includes(query)
      );
    });
  }, [glossary, search, countryFilter]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-charcoal-900/95 backdrop-blur-sm border-b border-charcoal-700">
        <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="p-2 rounded-lg text-charcoal-400 hover:text-charcoal-100
              hover:bg-charcoal-800 transition-colors duration-150 cursor-pointer flex-shrink-0"
            aria-label="Back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-serif font-semibold text-temple-gold">
            Encyclopedia
          </h1>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full">
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search terms, Pali words..."
            className="w-full px-4 py-3 rounded-xl
              bg-charcoal-800 border border-charcoal-600
              text-charcoal-100 placeholder:text-charcoal-500 text-sm
              focus:outline-none focus:border-saffron-500/50 focus:ring-1 focus:ring-saffron-500/30
              transition-colors duration-200"
          />
        </div>

        {/* Country filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {availableCountries.map((country) => (
            <button
              key={country}
              onClick={() => setCountryFilter(country)}
              className={`px-3 py-1.5 rounded-full text-xs border
                transition-all duration-200 cursor-pointer
                ${countryFilter === country
                  ? 'bg-saffron-500/15 border-saffron-500/50 text-saffron-400'
                  : 'bg-charcoal-800 border-charcoal-600 text-charcoal-400 hover:border-charcoal-500'
                }`}
            >
              {COUNTRY_LABELS[country] || country}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-xs text-charcoal-500 mb-4">
          {filtered.length} {filtered.length === 1 ? 'term' : 'terms'} found
        </p>

        {/* Glossary list */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-charcoal-400 text-sm">No terms match your search.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((entry, index) => {
              const isExpanded = expandedTerm === index;
              return (
                <button
                  key={index}
                  onClick={() => setExpandedTerm(isExpanded ? null : index)}
                  className="w-full text-left px-4 py-3 rounded-xl
                    bg-charcoal-800 border border-charcoal-700
                    hover:border-charcoal-600
                    transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-charcoal-100">
                      {entry.term}
                    </span>
                    {entry.pali && (
                      <span className="text-xs text-saffron-400/70 italic flex-shrink-0">
                        {entry.pali}
                      </span>
                    )}
                  </div>

                  {entry.translation && (
                    <p className="text-xs text-charcoal-400 mt-1">
                      &ldquo;{entry.translation}&rdquo;
                    </p>
                  )}

                  {isExpanded && entry.description && (
                    <p className="text-xs text-charcoal-300 leading-relaxed mt-3 pt-3
                      border-t border-charcoal-700">
                      {entry.description}
                    </p>
                  )}

                  {isExpanded && entry.country && entry.country !== 'general' && (
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full
                      bg-charcoal-700 text-charcoal-400">
                      {COUNTRY_LABELS[entry.country] || entry.country}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
