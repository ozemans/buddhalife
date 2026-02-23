import { useState, useCallback, useRef } from 'react';

export default function Tooltip({ term, definition, children }) {
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef(null);

  const tooltipCallbackRef = useCallback(
    (node) => {
      if (!node || !triggerRef.current) return;
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = node.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      let left = (triggerRect.width - tooltipRect.width) / 2;
      const tooltipLeftEdge = triggerRect.left + left;
      const tooltipRightEdge = tooltipLeftEdge + tooltipRect.width;

      if (tooltipLeftEdge < 8) {
        left = -triggerRect.left + 8;
      } else if (tooltipRightEdge > viewportWidth - 8) {
        left = viewportWidth - 8 - tooltipRect.width - triggerRect.left;
      }

      node.style.left = `${left}px`;
    },
    [],
  );

  const toggle = () => setVisible((v) => !v);
  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  return (
    <span
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={show}
      onMouseLeave={hide}
      onClick={toggle}
    >
      <span className="cursor-help text-text-primary font-medium">
        {children}
      </span>
      {visible && (
        <span
          ref={tooltipCallbackRef}
          className="absolute bottom-full mb-2 z-40
            w-60 px-4 py-3 rounded-lg
            bg-white border border-button-border shadow-md
            text-left
            pointer-events-none"
          style={{ animation: 'fadeIn 150ms ease-out' }}
        >
          <span className="block text-sm font-semibold text-text-primary mb-0.5">
            {term}
          </span>
          <span className="block text-xs leading-relaxed text-text-secondary">
            {definition}
          </span>
          <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0
            border-l-[6px] border-l-transparent
            border-r-[6px] border-r-transparent
            border-t-[6px] border-t-white" />
        </span>
      )}
    </span>
  );
}
