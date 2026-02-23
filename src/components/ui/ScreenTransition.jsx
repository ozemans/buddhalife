import { useState, useEffect, useRef } from 'react';

export default function ScreenTransition({ screenKey, children }) {
  const [displayChildren, setDisplayChildren] = useState(children);
  const [style, setStyle] = useState({ opacity: 1, transform: 'translateY(0)' });
  const isFirstRender = useRef(true);
  const prevKey = useRef(screenKey);

  useEffect(() => {
    // Skip animation on initial mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevKey.current = screenKey;
      return;
    }

    // Only animate when screenKey actually changes
    if (screenKey === prevKey.current) {
      setDisplayChildren(children);
      return;
    }

    prevKey.current = screenKey;

    // Start hidden
    setStyle({ opacity: 0, transform: 'translateY(12px)' });
    setDisplayChildren(children);

    // Animate in on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setStyle({ opacity: 1, transform: 'translateY(0)' });
      });
    });
  }, [screenKey, children]);

  return (
    <div
      style={{
        ...style,
        transition: 'opacity 250ms ease-out, transform 250ms ease-out',
        willChange: 'opacity, transform',
      }}
    >
      {displayChildren}
    </div>
  );
}
