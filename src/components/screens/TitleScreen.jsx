import { useState } from 'react';

const COUNTRIES = [
  {
    id: 'thailand',
    name: 'Thailand',
    flag: '\uD83C\uDDF9\uD83C\uDDED',
    teaser: 'Gilded temples, spirit houses, and the Land of Smiles.',
  },
  {
    id: 'myanmar',
    name: 'Myanmar',
    flag: '\uD83C\uDDF2\uD83C\uDDF2',
    teaser: 'Ancient Bagan pagodas and deep monastic devotion.',
  },
  {
    id: 'cambodia',
    name: 'Cambodia',
    flag: '\uD83C\uDDF0\uD83C\uDDED',
    teaser: 'Angkor heritage and Buddhist resilience reborn.',
  },
  {
    id: 'vietnam',
    name: 'Vietnam',
    flag: '\uD83C\uDDFB\uD83C\uDDF3',
    teaser: 'Mahayana, Theravada, and Confucian values intertwined.',
  },
  {
    id: 'laos',
    name: 'Laos',
    flag: '\uD83C\uDDF1\uD83C\uDDE6',
    teaser: 'Dawn alms rounds in the quiet heart of Indochina.',
  },
];

function ProgressDots({ current, total }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 24 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i === current ? '#E8960C' : '#D1D1D6',
            transition: 'all 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}

export default function TitleScreen({ onStartGame, backgrounds }) {
  const [step, setStep] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [name, setName] = useState('');
  const [gender, setGender] = useState(null);
  const [selectedBackground, setSelectedBackground] = useState(null);

  const bgOptions =
    backgrounds && selectedCountry && Array.isArray(backgrounds[selectedCountry])
      ? backgrounds[selectedCountry]
      : [];

  const handleStartLife = () => {
    if (!name.trim() || !gender || !selectedBackground) return;
    onStartGame({
      name: name.trim(),
      country: selectedCountry,
      background: selectedBackground,
      gender,
    });
  };

  // Step 0: Title
  if (step === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.inner}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: 64, lineHeight: 1, marginBottom: 16 }}>☸️</span>
            <h1 style={styles.title}>BuddhaLife</h1>
            <p style={styles.subtitle}>Live a Buddhist life in Southeast Asia</p>
          </div>
          <div style={{ width: '100%', paddingBottom: 32 }}>
            <button
              onClick={() => setStep(1)}
              style={styles.primaryButton}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              New Life
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Country Selection
  if (step === 1) {
    return (
      <div style={styles.container}>
        <div style={styles.inner}>
          <ProgressDots current={0} total={3} />
          <h2 style={styles.stepTitle}>Choose Your Country</h2>
          <p style={styles.stepSubtitle}>Where will your life begin?</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 24 }}>
            {COUNTRIES.map((country) => {
              const isSelected = selectedCountry === country.id;
              return (
                <button
                  key={country.id}
                  onClick={() => {
                    setSelectedCountry(country.id);
                    setSelectedBackground(null);
                  }}
                  style={{
                    ...styles.countryCard,
                    borderColor: isSelected ? '#34C759' : '#E5E5EA',
                    backgroundColor: '#FFFFFF',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
                    <span style={{ fontSize: 48, lineHeight: 1, flexShrink: 0 }}>{country.flag}</span>
                    <div style={{ textAlign: 'left', flex: 1 }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: '#1D1D1F', display: 'block' }}>
                        {country.name}
                      </span>
                      <span style={{ fontSize: 14, color: '#6E6E73', display: 'block', marginTop: 2, lineHeight: 1.4 }}>
                        {country.teaser}
                      </span>
                    </div>
                    {isSelected && (
                      <span style={{ fontSize: 22, color: '#34C759', flexShrink: 0 }}>✓</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ width: '100%', marginTop: 'auto', paddingTop: 24, paddingBottom: 16 }}>
            <button
              onClick={() => {
                if (selectedCountry) setStep(2);
              }}
              disabled={!selectedCountry}
              style={{
                ...styles.primaryButton,
                opacity: selectedCountry ? 1 : 0.4,
                cursor: selectedCountry ? 'pointer' : 'not-allowed',
              }}
              onMouseDown={(e) => { if (selectedCountry) e.currentTarget.style.transform = 'scale(0.97)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              Begin
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Character Creation
  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <ProgressDots current={2} total={3} />
        <h2 style={styles.stepTitle}>Create Your Character</h2>
        <p style={styles.stepSubtitle}>Who will you be?</p>

        <div style={{ width: '100%', marginTop: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Name input */}
          <div>
            <label style={styles.fieldLabel}>Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              maxLength={24}
              style={styles.textInput}
            />
          </div>

          {/* Gender selection */}
          <div>
            <label style={styles.fieldLabel}>Gender</label>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { id: 'male', emoji: '👨', label: 'Male' },
                { id: 'female', emoji: '👩', label: 'Female' },
              ].map((g) => {
                const isSelected = gender === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setGender(g.id)}
                    style={{
                      ...styles.pill,
                      flex: 1,
                      borderColor: isSelected ? '#E8960C' : '#D1D1D6',
                      backgroundColor: isSelected ? 'rgba(232, 150, 12, 0.08)' : '#F2F2F7',
                      color: isSelected ? '#E8960C' : '#1D1D1F',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    <span style={{ fontSize: 24, marginRight: 8 }}>{g.emoji}</span>
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Family background */}
          <div>
            <label style={styles.fieldLabel}>Family Background</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bgOptions.map((bg) => {
                const isSelected = selectedBackground === bg.id;
                return (
                  <button
                    key={bg.id}
                    onClick={() => setSelectedBackground(bg.id)}
                    style={{
                      ...styles.bgPill,
                      borderColor: isSelected ? '#E8960C' : '#D1D1D6',
                      backgroundColor: isSelected ? 'rgba(232, 150, 12, 0.08)' : '#F2F2F7',
                      color: isSelected ? '#E8960C' : '#1D1D1F',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    {bg.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ width: '100%', marginTop: 'auto', paddingTop: 24, paddingBottom: 16 }}>
          <button
            onClick={handleStartLife}
            disabled={!name.trim() || !gender || !selectedBackground}
            style={{
              ...styles.primaryButton,
              opacity: name.trim() && gender && selectedBackground ? 1 : 0.4,
              cursor: name.trim() && gender && selectedBackground ? 'pointer' : 'not-allowed',
            }}
            onMouseDown={(e) => {
              if (name.trim() && gender && selectedBackground) e.currentTarget.style.transform = 'scale(0.97)';
            }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Start Life
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 16px',
  },
  inner: {
    width: '100%',
    maxWidth: 480,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: '#1D1D1F',
    letterSpacing: '-0.02em',
    margin: 0,
    lineHeight: 1.2,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  subtitle: {
    fontSize: 16,
    color: '#6E6E73',
    marginTop: 8,
    fontWeight: 400,
    lineHeight: 1.5,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1D1D1F',
    letterSpacing: '-0.02em',
    margin: 0,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6E6E73',
    marginTop: 6,
    fontWeight: 400,
    textAlign: 'center',
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
  countryCard: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 16,
    border: '2px solid #E5E5EA',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
  },
  fieldLabel: {
    display: 'block',
    fontSize: 14,
    fontWeight: 600,
    color: '#6E6E73',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  textInput: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 12,
    border: '1px solid #D1D1D6',
    backgroundColor: '#F2F2F7',
    fontSize: 16,
    color: '#1D1D1F',
    outline: 'none',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  },
  pill: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 16px',
    borderRadius: 12,
    border: '2px solid #D1D1D6',
    backgroundColor: '#F2F2F7',
    fontSize: 16,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  bgPill: {
    width: '100%',
    textAlign: 'left',
    padding: '12px 16px',
    borderRadius: 12,
    border: '2px solid #D1D1D6',
    backgroundColor: '#F2F2F7',
    fontSize: 15,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
};
