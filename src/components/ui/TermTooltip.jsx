import { useState, useRef, useCallback, useEffect } from 'react';

export default function TermTooltip({ term, translation, description, children }) {
  const [visible, setVisible] = useState(false);
  const wrapperRef = useRef(null);
  const tooltipRef = useCallback(
    (node) => {
      if (!node || !wrapperRef.current) return;
      const triggerRect = wrapperRef.current.getBoundingClientRect();
      const tooltipRect = node.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      // Center tooltip below the term
      let left = (triggerRect.width - tooltipRect.width) / 2;
      const tooltipLeftEdge = triggerRect.left + left;
      const tooltipRightEdge = tooltipLeftEdge + tooltipRect.width;

      // Keep tooltip within viewport with 8px padding
      if (tooltipLeftEdge < 8) {
        left = -triggerRect.left + 8;
      } else if (tooltipRightEdge > viewportWidth - 8) {
        left = viewportWidth - 8 - tooltipRect.width - triggerRect.left;
      }

      node.style.left = `${left}px`;
    },
    [],
  );

  const toggle = (e) => {
    e.stopPropagation();
    setVisible((v) => !v);
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setVisible(false);
      }
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [visible]);

  return (
    <span
      ref={wrapperRef}
      style={{ position: 'relative', display: 'inline' }}
    >
      <span
        onClick={toggle}
        style={{
          color: '#E8960C',
          textDecorationLine: 'underline',
          textDecorationStyle: 'dotted',
          textDecorationColor: '#E8960C',
          textUnderlineOffset: '3px',
          cursor: 'pointer',
        }}
      >
        {children}
      </span>
      {visible && (
        <span
          ref={tooltipRef}
          style={{
            position: 'absolute',
            top: '100%',
            marginTop: 6,
            zIndex: 100,
            width: 260,
            maxWidth: '90vw',
            padding: '12px 16px',
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            textAlign: 'left',
            pointerEvents: 'auto',
          }}
        >
          {/* Arrow pointing up */}
          <span
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '6px solid #FFFFFF',
            }}
          />
          <span
            style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 700,
              color: '#1D1D1F',
              marginBottom: 2,
              lineHeight: 1.3,
            }}
          >
            {term}
          </span>
          <span
            style={{
              display: 'block',
              fontSize: 13,
              fontStyle: 'italic',
              color: '#E8960C',
              marginBottom: 6,
              lineHeight: 1.3,
            }}
          >
            {translation}
          </span>
          <span
            style={{
              display: '-webkit-box',
              fontSize: 13,
              fontWeight: 400,
              color: '#1D1D1F',
              lineHeight: 1.5,
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </span>
        </span>
      )}
    </span>
  );
}
