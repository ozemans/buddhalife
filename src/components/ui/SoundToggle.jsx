import { useState } from 'react';
import { initAudio, isMuted, setMuted } from '../../engine/audioEngine.js';

export default function SoundToggle() {
  const [muted, setMutedState] = useState(() => isMuted());

  const handleClick = (e) => {
    e.stopPropagation();

    if (!muted) {
      // Turning sound OFF
      setMuted(true);
      setMutedState(true);
    } else {
      // Turning sound ON -- initialize AudioContext on this user gesture
      initAudio();
      setMuted(false);
      setMutedState(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        cursor: 'pointer',
        fontSize: 18,
        lineHeight: 1,
        padding: '4px 8px',
        borderRadius: 12,
        minWidth: 44,
        minHeight: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label={muted ? 'Unmute sound' : 'Mute sound'}
      title={muted ? 'Unmute sound' : 'Mute sound'}
    >
      {muted ? '\uD83D\uDD07' : '\uD83D\uDD0A'}
    </button>
  );
}
