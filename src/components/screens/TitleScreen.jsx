import { useState } from 'react';
import Button from '../ui/Button';

const COUNTRIES = [
  {
    id: 'thailand',
    name: 'Thailand',
    flag: '\uD83C\uDDF9\uD83C\uDDED',
    description: 'Land of Smiles. Theravada Buddhism shapes daily life from gilded temples to spirit houses.',
  },
  {
    id: 'myanmar',
    name: 'Myanmar',
    flag: '\uD83C\uDDF2\uD83C\uDDF2',
    description: 'Ancient Bagan pagodas and deep monastic traditions define this devout nation.',
  },
  {
    id: 'cambodia',
    name: 'Cambodia',
    flag: '\uD83C\uDDF0\uD83C\uDDED',
    description: 'Home of Angkor Wat, where Khmer heritage and Buddhist resilience endure.',
  },
  {
    id: 'vietnam',
    name: 'Vietnam',
    flag: '\uD83C\uDDFB\uD83C\uDDF3',
    description: 'Mahayana and Theravada blend with Confucian values in a rapidly changing society.',
  },
  {
    id: 'laos',
    name: 'Laos',
    flag: '\uD83C\uDDF1\uD83C\uDDE6',
    description: 'The quiet heart of Indochina, where saffron-robed monks walk dawn alms rounds.',
  },
];

const BACKGROUNDS = [
  { id: 'farmer', label: 'Farming Family' },
  { id: 'merchant', label: 'Market Merchant' },
  { id: 'monk', label: 'Temple Ward' },
  { id: 'noble', label: 'Minor Nobility' },
  { id: 'artisan', label: 'Artisan Household' },
];

export default function TitleScreen({ onStartGame, backgrounds }) {
  const [name, setName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedBackground, setSelectedBackground] = useState(null);

  // backgrounds is a nested object { thailand: [...], myanmar: [...] }
  // Show country-specific options when a country is selected, or generic fallback
  const bgOptions = (backgrounds && selectedCountry && Array.isArray(backgrounds[selectedCountry]))
    ? backgrounds[selectedCountry]
    : BACKGROUNDS;

  const canStart = name.trim().length > 0 && selectedCountry && selectedBackground;

  const handleStart = () => {
    if (!canStart) return;
    onStartGame({
      name: name.trim(),
      country: selectedCountry,
      background: selectedBackground,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8 md:py-16">
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-temple-gold mb-3">
          BuddhaLife
        </h1>
        <p className="text-sm md:text-base text-charcoal-300 italic font-serif">
          A life unfolds between merit and desire
        </p>
        <div className="mt-4 mx-auto w-24 h-px bg-gradient-to-r from-transparent via-temple-gold/50 to-transparent" />
      </div>

      {/* Character Name */}
      <div className="w-full max-w-md mb-8">
        <label className="block text-sm text-charcoal-300 mb-2">Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name..."
          maxLength={24}
          className="w-full px-4 py-3 rounded-xl
            bg-charcoal-800 border border-charcoal-600
            text-charcoal-100 placeholder:text-charcoal-500
            focus:outline-none focus:border-saffron-500/50 focus:ring-1 focus:ring-saffron-500/30
            transition-colors duration-200"
        />
      </div>

      {/* Country Selection */}
      <div className="w-full max-w-md mb-8">
        <label className="block text-sm text-charcoal-300 mb-3">Choose Your Country</label>
        <div className="grid grid-cols-1 gap-3">
          {COUNTRIES.map((country) => (
            <button
              key={country.id}
              onClick={() => { setSelectedCountry(country.id); setSelectedBackground(null); }}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-left
                transition-all duration-200 cursor-pointer
                ${selectedCountry === country.id
                  ? 'bg-saffron-500/10 border-saffron-500/50 shadow-sm shadow-saffron-500/10'
                  : 'bg-charcoal-800 border-charcoal-600 hover:border-charcoal-500'
                }`}
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{country.flag}</span>
              <div className="min-w-0">
                <span className={`block text-sm font-medium ${
                  selectedCountry === country.id ? 'text-saffron-400' : 'text-charcoal-100'
                }`}>
                  {country.name}
                </span>
                <span className="block text-xs text-charcoal-400 mt-0.5 leading-relaxed">
                  {country.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Background Selection */}
      <div className="w-full max-w-md mb-10">
        <label className="block text-sm text-charcoal-300 mb-3">Family Background</label>
        <div className="flex flex-wrap gap-2">
          {bgOptions.map((bg) => (
            <button
              key={bg.id}
              onClick={() => setSelectedBackground(bg.id)}
              className={`px-4 py-2 rounded-full text-sm border
                transition-all duration-200 cursor-pointer
                ${selectedBackground === bg.id
                  ? 'bg-saffron-500/15 border-saffron-500/50 text-saffron-400'
                  : 'bg-charcoal-800 border-charcoal-600 text-charcoal-300 hover:border-charcoal-500'
                }`}
            >
              {bg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <div className="w-full max-w-md">
        <Button
          variant="primary"
          size="lg"
          onClick={handleStart}
          disabled={!canStart}
          className="w-full text-lg"
        >
          Begin Life
        </Button>
        {!canStart && (
          <p className="text-xs text-charcoal-500 text-center mt-3">
            Choose a name, country, and background to begin
          </p>
        )}
      </div>
    </div>
  );
}
