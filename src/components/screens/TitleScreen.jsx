import { useState } from 'react';

const COUNTRIES = [
  {
    id: 'thailand',
    name: 'Thailand',
    flag: '\uD83C\uDDF9\uD83C\uDDED',
    teaser: 'Spirit houses, novice ordination, and a merit economy shaped by everyday generosity.',
  },
  {
    id: 'myanmar',
    name: 'Myanmar',
    flag: '\uD83C\uDDF2\uD83C\uDDF2',
    teaser: 'Pagoda patronage, Karen moral economies, and monastic authority in a divided state.',
  },
  {
    id: 'cambodia',
    name: 'Cambodia',
    flag: '\uD83C\uDDF0\uD83C\uDDED',
    teaser: 'Peace walks, forest ordination, and Buddhism rebuilt after the Khmer Rouge.',
  },
  {
    id: 'vietnam',
    name: 'Vietnam',
    flag: '\uD83C\uDDFB\uD83C\uDDF3',
    teaser: 'Ancestor altars, restless spirits, and young Buddhists remaking tradition.',
  },
  {
    id: 'laos',
    name: 'Laos',
    flag: '\uD83C\uDDF1\uD83C\uDDE6',
    teaser: 'Alms rounds, elaborate funerary rites, and merit transferred across generations.',
  },
];

const NAMES = {
  thailand: {
    male: ['Somchai', 'Arthit', 'Nattapong', 'Prasert', 'Kittisak', 'Wichai', 'Sompong', 'Tanakorn', 'Prayut', 'Surasak'],
    female: ['Siriporn', 'Malai', 'Nanthana', 'Kanokwan', 'Ploy', 'Arunee', 'Suwannee', 'Duangjai', 'Ratchanee', 'Kanya'],
  },
  myanmar: {
    male: ['Aung', 'Kyaw', 'Zaw', 'Htun', 'Maung', 'Thet', 'Ye', 'Naing', 'Myo', 'Ko Ko'],
    female: ['Aye', 'Khin', 'Tin', 'May', 'Nwe', 'Su', 'Wai', 'Phyu', 'Cho', 'Hla'],
  },
  cambodia: {
    male: ['Sokha', 'Chanthea', 'Vibol', 'Rith', 'Dara', 'Piseth', 'Rithy', 'Kosal', 'Chamroeun', 'Vanna'],
    female: ['Sreymom', 'Chantrea', 'Bopha', 'Kunthea', 'Srey Leak', 'Malis', 'Kolab', 'Channary', 'Theary', 'Rachana'],
  },
  vietnam: {
    male: ['Minh', 'Duc', 'Thanh', 'Hieu', 'Hung', 'Tuan', 'Quang', 'Long', 'Duy', 'Phong'],
    female: ['Lan', 'Mai', 'Huong', 'Linh', 'Thao', 'Ngoc', 'Anh', 'Trang', 'Ha', 'Phuong'],
  },
  laos: {
    male: ['Bounmy', 'Khampha', 'Somphet', 'Vilay', 'Keo', 'Somphone', 'Bounsang', 'Thongkham', 'Phet', 'Souphanouvong'],
    female: ['Bouachanh', 'Khamla', 'Chansouk', 'Viengkham', 'Dao', 'Keo', 'Souliya', 'Manivanh', 'Phimpha', 'Noi'],
  },
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function TitleScreen({ onStartGame, backgrounds, hasSavedGame, onContinue }) {
  const [step, setStep] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const handleBeginLife = () => {
    if (!selectedCountry) return;

    const gender = Math.random() < 0.5 ? 'male' : 'female';
    const countryNames = NAMES[selectedCountry]?.[gender] || NAMES.thailand.male;
    const name = pickRandom(countryNames);

    const bgOptions =
      backgrounds && Array.isArray(backgrounds[selectedCountry])
        ? backgrounds[selectedCountry]
        : [];
    const background = bgOptions.length > 0 ? pickRandom(bgOptions).id : 'unknown';

    onStartGame({ name, country: selectedCountry, background, gender });
  };

  // Step 0: Title
  if (step === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.inner}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: 64, lineHeight: 1, marginBottom: 16 }}>☸️</span>
            <h1 style={styles.title}>Samsara</h1>
            <p style={styles.subtitle}>Live a Buddhist life in Southeast Asia</p>
          </div>
          <div style={{ width: '100%', paddingBottom: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={() => setStep(1)}
              style={styles.primaryButton}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              New Life
            </button>
            {hasSavedGame && (
              <button
                onClick={onContinue}
                style={styles.continueButton}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Country Selection → auto-start
  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <h2 style={styles.stepTitle}>Choose Your Country</h2>
        <p style={styles.stepSubtitle}>Where will your life begin?</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 24 }}>
          {COUNTRIES.map((country) => {
            const isSelected = selectedCountry === country.id;
            return (
              <button
                key={country.id}
                onClick={() => setSelectedCountry(country.id)}
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
            onClick={handleBeginLife}
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
            Begin Life
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
    alignItems: 'center',
    padding: '0 16px',
  },
  inner: {
    width: '100%',
    maxWidth: 480,
    minHeight: '100dvh',
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
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    border: '2px solid #E8960C',
    backgroundColor: '#F2F2F7',
    color: '#E8960C',
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
};
