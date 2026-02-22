import { useState } from 'react';
import Button from '../ui/Button';

export default function EventCard({ event, onChoice }) {
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showOutcome, setShowOutcome] = useState(false);

  if (!event) return null;

  const handleChoice = (choice) => {
    setSelectedChoice(choice);
    setShowOutcome(true);
  };

  const handleContinue = () => {
    onChoice(selectedChoice.id);
    setSelectedChoice(null);
    setShowOutcome(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        className="relative bg-charcoal-800 border border-charcoal-600 rounded-2xl
          shadow-xl overflow-hidden"
      >
        {/* Decorative top border */}
        <div className="h-1 bg-gradient-to-r from-saffron-500 via-temple-gold to-saffron-500" />

        {/* Decorative corner motifs */}
        <div className="absolute top-3 left-3 text-temple-gold/20 text-lg select-none">&#9753;</div>
        <div className="absolute top-3 right-3 text-temple-gold/20 text-lg select-none">&#9753;</div>

        <div className="px-6 pt-8 pb-6">
          {/* Event category tag */}
          {event.category && (
            <span className="inline-block px-3 py-1 mb-4 text-xs font-medium uppercase tracking-wider
              rounded-full bg-saffron-500/10 text-saffron-400 border border-saffron-500/20">
              {event.category}
            </span>
          )}

          {/* Narrative text */}
          <p className="text-base md:text-lg leading-relaxed text-charcoal-100 font-serif mb-6">
            {showOutcome && selectedChoice?.outcome
              ? selectedChoice.outcome
              : event.narrative}
          </p>

          {/* Choices or Continue */}
          {!showOutcome ? (
            <div className="space-y-3">
              {event.choices?.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice)}
                  className="w-full text-left px-5 py-3.5 rounded-xl
                    bg-charcoal-700 border border-charcoal-500
                    hover:border-saffron-500/50 hover:bg-charcoal-700/80
                    active:bg-charcoal-600
                    transition-all duration-200
                    text-charcoal-100 text-sm md:text-base
                    cursor-pointer group"
                >
                  <span className="inline-block w-6 h-6 mr-3 text-center text-xs
                    leading-6 rounded-full bg-saffron-500/15 text-saffron-400
                    group-hover:bg-saffron-500/25 transition-colors duration-200">
                    {String.fromCharCode(64 + choice.id)}
                  </span>
                  {choice.text}
                </button>
              ))}
            </div>
          ) : (
            <div className="pt-2">
              <Button variant="primary" size="md" onClick={handleContinue} className="w-full">
                Continue
              </Button>
            </div>
          )}
        </div>

        {/* Decorative bottom border */}
        <div className="h-1 bg-gradient-to-r from-saffron-500 via-temple-gold to-saffron-500" />
      </div>
    </div>
  );
}
