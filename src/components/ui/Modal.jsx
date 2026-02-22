import { useEffect, useRef } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4
        bg-charcoal-900/80 backdrop-blur-sm
        animate-[fadeIn_200ms_ease-out]"
      style={{
        animation: 'fadeIn 200ms ease-out',
      }}
    >
      <div
        className="relative w-full max-w-md max-h-[85vh] overflow-y-auto
          bg-charcoal-800 border border-charcoal-600 rounded-2xl shadow-2xl
          animate-[slideUp_250ms_ease-out]"
        style={{
          animation: 'slideUp 250ms ease-out',
        }}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-charcoal-700">
          <h2 className="text-xl font-serif font-semibold text-temple-gold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-100
              hover:bg-charcoal-700 transition-colors duration-150 cursor-pointer"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
