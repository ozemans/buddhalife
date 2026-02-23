import { useState, useMemo } from 'react';

const COUNTRY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'thailand', label: '🇹🇭 Thailand' },
  { id: 'myanmar', label: '🇲🇲 Myanmar' },
  { id: 'cambodia', label: '🇰🇭 Cambodia' },
  { id: 'vietnam', label: '🇻🇳 Vietnam' },
  { id: 'laos', label: '🇱🇦 Laos' },
];

export default function EncyclopediaScreen({ glossary = [], onBack }) {
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return glossary.filter((entry) => {
      // Country filter: check if the entry's countries array includes the filter
      const matchesCountry =
        countryFilter === 'all' ||
        (Array.isArray(entry.countries) && entry.countries.includes(countryFilter)) ||
        (entry.country === countryFilter);
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
    <div style={styles.container}>
      <div style={styles.inner}>
        {/* Header */}
        <header style={styles.header}>
          <button onClick={onBack} style={styles.backButton} aria-label="Back">
            <span style={{ fontSize: 20, lineHeight: 1 }}>←</span>
          </button>
          <h1 style={styles.headerTitle}>Encyclopedia</h1>
          <div style={{ width: 40 }} />
        </header>

        {/* Search bar */}
        <div style={{ width: '100%', marginBottom: 16 }}>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 16,
              color: '#6E6E73',
              pointerEvents: 'none',
            }}>
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search terms, Pali words..."
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* Country filter pills */}
        <div style={styles.filterRow}>
          {COUNTRY_FILTERS.map((filter) => {
            const isActive = countryFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setCountryFilter(filter.id)}
                style={{
                  ...styles.filterPill,
                  backgroundColor: isActive ? 'rgba(232, 150, 12, 0.1)' : '#F2F2F7',
                  borderColor: isActive ? '#E8960C' : '#D1D1D6',
                  color: isActive ? '#E8960C' : '#6E6E73',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <p style={{ fontSize: 13, color: '#6E6E73', marginBottom: 12, alignSelf: 'flex-start' }}>
          {filtered.length} {filtered.length === 1 ? 'term' : 'terms'} found
        </p>

        {/* Glossary list */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 48, paddingBottom: 48 }}>
            <span style={{ fontSize: 32, display: 'block', marginBottom: 12 }}>📖</span>
            <p style={{ fontSize: 15, color: '#6E6E73' }}>No terms match your search.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', paddingBottom: 32 }}>
            {filtered.map((entry, index) => (
              <div key={index} style={styles.termCard}>
                {/* Term name and Pali */}
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#1D1D1F' }}>
                    {entry.term}
                  </span>
                  {entry.pali && entry.pali !== entry.term && (
                    <span style={{ fontSize: 14, color: '#6E6E73', marginLeft: 8 }}>
                      ({entry.pali})
                    </span>
                  )}
                </div>

                {/* Translation */}
                {entry.translation && (
                  <p style={{ fontSize: 14, color: '#E8960C', margin: 0, marginBottom: 6, fontWeight: 500, lineHeight: 1.4 }}>
                    {entry.translation}
                  </p>
                )}

                {/* Description */}
                {entry.description && (
                  <p style={{ fontSize: 14, color: '#1D1D1F', margin: 0, lineHeight: 1.6, opacity: 0.8 }}>
                    {entry.description}
                  </p>
                )}

                {/* Country tags */}
                {Array.isArray(entry.countries) && entry.countries.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                    {entry.countries.map((c) => (
                      <span key={c} style={styles.countryTag}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    minHeight: 56,
    backgroundColor: '#E8960C',
    borderRadius: '0 0 16px 16px',
    padding: '0 12px',
    paddingTop: 'env(safe-area-inset-top, 0px)',
    marginBottom: 20,
    position: 'sticky',
    top: 0,
    zIndex: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    border: 'none',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#FFFFFF',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#FFFFFF',
    margin: 0,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 42px',
    borderRadius: 12,
    border: '1px solid #D1D1D6',
    backgroundColor: '#F2F2F7',
    fontSize: 16,
    color: '#1D1D1F',
    outline: 'none',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    boxSizing: 'border-box',
  },
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
    marginBottom: 16,
  },
  filterPill: {
    padding: '6px 14px',
    borderRadius: 20,
    border: '1.5px solid #D1D1D6',
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    whiteSpace: 'nowrap',
  },
  termCard: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    border: '1px solid #E5E5EA',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  countryTag: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
    fontSize: 12,
    color: '#6E6E73',
    fontWeight: 500,
  },
};
