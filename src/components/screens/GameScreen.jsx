import { useState } from 'react';
import StatsPanel from '../game/StatsPanel';
import EventCard from '../game/EventCard';
import AgeAdvance from '../game/AgeAdvance';
import Timeline from '../game/Timeline';
import KarmaVisualizer from '../game/KarmaVisualizer';

const COUNTRY_FLAGS = {
  thailand: '\uD83C\uDDF9\uD83C\uDDED',
  myanmar: '\uD83C\uDDF2\uD83C\uDDF2',
  cambodia: '\uD83C\uDDF0\uD83C\uDDED',
  vietnam: '\uD83C\uDDFB\uD83C\uDDF3',
  laos: '\uD83C\uDDF1\uD83C\uDDE6',
};

const LIFE_STAGES = [
  { max: 0, label: 'Birth' },
  { max: 5, label: 'Infancy' },
  { max: 12, label: 'Childhood' },
  { max: 17, label: 'Adolescence' },
  { max: 29, label: 'Young Adult' },
  { max: 49, label: 'Adult' },
  { max: 64, label: 'Middle Age' },
  { max: 79, label: 'Elder' },
  { max: Infinity, label: 'Venerable' },
];

function getLifeStage(age) {
  return LIFE_STAGES.find((s) => age <= s.max)?.label || 'Elder';
}

function getAgeEmoji(age) {
  if (age <= 2) return '\uD83D\uDC76';    // baby
  if (age <= 12) return '\uD83E\uDDD2';   // child
  if (age <= 17) return '\uD83D\uDC66';   // teen
  if (age <= 64) return '\uD83D\uDC68';   // adult
  return '\uD83E\uDDD3';                   // elder
}

const TABS = [
  { id: 'karma', emoji: '\u2638\uFE0F', label: 'Karma' },
  { id: 'health', emoji: '\u2764\uFE0F', label: 'Health' },
  { id: 'wealth', emoji: '\uD83D\uDCB0', label: 'Wealth' },
  { id: 'profile', emoji: '\uD83D\uDC64', label: 'Profile' },
  { id: 'log', emoji: '\uD83D\uDCCB', label: 'Log' },
];

function WealthTab({ stats, lifeEvents }) {
  const wealth = Math.max(0, Math.min(100, stats.wealth ?? 50));
  const financialEvents = lifeEvents
    .filter((e) => {
      const tags = e.tags || [];
      const title = (e.title || '').toLowerCase();
      return (
        tags.includes('financial') ||
        tags.includes('wealth') ||
        tags.includes('commerce') ||
        tags.includes('sponsorship') ||
        title.includes('money') ||
        title.includes('wealth') ||
        title.includes('market') ||
        title.includes('gambling')
      );
    })
    .slice(-5)
    .reverse();

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <span style={{ fontSize: 48 }}>{'\uD83D\uDCB0'}</span>
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: '#1D1D1F',
            marginTop: 8,
          }}
        >
          {wealth}
        </div>
        <div style={{ fontSize: 14, color: '#6E6E73' }}>Wealth</div>
      </div>

      <div style={{ margin: '0 auto', maxWidth: 300 }}>
        <div
          style={{
            height: 12,
            borderRadius: 6,
            backgroundColor: '#F2F2F7',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${wealth}%`,
              borderRadius: 6,
              backgroundColor:
                wealth >= 70 ? '#34C759' : wealth >= 40 ? '#FF9500' : '#FF3B30',
              transition: 'width 0.5s ease-out',
            }}
          />
        </div>
      </div>

      {financialEvents.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#6E6E73',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 12,
            }}
          >
            Recent Financial Events
          </div>
          {financialEvents.map((ev, i) => (
            <div
              key={i}
              style={{
                padding: '10px 0',
                borderBottom: '1px solid #F2F2F7',
                fontSize: 14,
                color: '#1D1D1F',
              }}
            >
              <span style={{ color: '#6E6E73', marginRight: 8 }}>
                Age {ev.age}
              </span>
              {ev.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileTab({ character, age, lifeStage }) {
  const countryFlag = COUNTRY_FLAGS[character.country] || '';
  const countryName = character.country
    ? character.country.charAt(0).toUpperCase() + character.country.slice(1)
    : '';

  return (
    <div style={{ padding: '24px 0', textAlign: 'center' }}>
      <span style={{ fontSize: 64 }}>{getAgeEmoji(age)}</span>
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: '#1D1D1F',
          marginTop: 12,
          letterSpacing: '-0.02em',
        }}
      >
        {character.name || 'Unknown'}
      </div>
      <div style={{ fontSize: 16, color: '#6E6E73', marginTop: 4 }}>
        Age {age} {'\u00B7'} {lifeStage}
      </div>
      <div style={{ fontSize: 16, color: '#6E6E73', marginTop: 4 }}>
        {countryFlag} {countryName}
      </div>

      {character.background && (
        <div
          style={{
            marginTop: 24,
            padding: '16px',
            backgroundColor: '#F5F5F7',
            borderRadius: 12,
            textAlign: 'left',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#6E6E73',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 8,
            }}
          >
            Background
          </div>
          <div style={{ fontSize: 14, color: '#1D1D1F', lineHeight: 1.5 }}>
            {character.background}
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: 16,
          padding: '16px',
          backgroundColor: '#F5F5F7',
          borderRadius: 12,
          textAlign: 'left',
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#6E6E73',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 8,
          }}
        >
          Details
        </div>
        <div style={{ fontSize: 14, color: '#1D1D1F', lineHeight: 1.8 }}>
          <div>
            <span style={{ color: '#6E6E73' }}>Born:</span>{' '}
            {character.birthYear || '---'}
          </div>
          <div>
            <span style={{ color: '#6E6E73' }}>Gender:</span>{' '}
            {character.gender || '---'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GameScreen({
  state,
  onAdvanceYear,
  onMakeChoice,
  onOpenEncyclopedia,
}) {
  const [activeTab, setActiveTab] = useState('game');

  const {
    character = {},
    stats = {},
    karma = { merit: 0, demerit: 0, momentum: 0 },
    currentEvent = null,
    lifeEvents = [],
    lifeStage: stateLifeStage,
  } = state || {};

  const age = character.age || 0;
  const lifeStage = stateLifeStage || getLifeStage(age);
  const avatarEmoji = getAgeEmoji(age);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const handleHeaderClick = () => {
    setActiveTab('game');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'karma':
        return (
          <div style={{ padding: '16px 0' }}>
            <KarmaVisualizer karma={karma} />
          </div>
        );
      case 'health':
        return (
          <div style={{ padding: '16px 0' }}>
            <StatsPanel stats={stats} />
          </div>
        );
      case 'wealth':
        return <WealthTab stats={stats} lifeEvents={lifeEvents} />;
      case 'profile':
        return (
          <ProfileTab character={character} age={age} lifeStage={lifeStage} />
        );
      case 'log':
        return (
          <div style={{ padding: '16px 0' }}>
            <Timeline events={lifeEvents} />
          </div>
        );
      default:
        return null;
    }
  };

  const renderGameContent = () => {
    if (currentEvent) {
      return <EventCard event={currentEvent} onChoice={onMakeChoice} />;
    }
    return (
      <AgeAdvance
        currentAge={age}
        lifeStage={lifeStage}
        onAdvance={onAdvanceYear}
      />
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxWidth: 480,
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        position: 'relative',
      }}
    >
      {/* Fixed header bar — 56px, saffron-gold */}
      <header
        onClick={handleHeaderClick}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          height: 56,
          backgroundColor: '#E8960C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          flexShrink: 0,
          cursor: activeTab !== 'game' ? 'pointer' : 'default',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24, lineHeight: 1 }}>{avatarEmoji}</span>
          <span
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}
          >
            {character.name || 'Unknown'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#FFFFFF',
            }}
          >
            Age: {age}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenEncyclopedia();
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 22,
              lineHeight: 1,
              padding: 4,
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Encyclopedia"
            title="Encyclopedia"
          >
            {'\uD83D\uDCD6'}
          </button>
        </div>
      </header>

      {/* Scrollable content area */}
      <main
        className="custom-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          maxWidth: 600,
          width: '100%',
          margin: '0 auto',
        }}
      >
        {activeTab === 'game' ? renderGameContent() : renderTabContent()}
      </main>

      {/* Fixed bottom tab bar — 83px, white bg */}
      <nav
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 30,
          height: 83,
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E5E5EA',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-around',
          paddingTop: 8,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          flexShrink: 0,
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 12px',
                minWidth: 56,
              }}
            >
              <span style={{ fontSize: 22, lineHeight: 1 }}>{tab.emoji}</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: isActive ? '#E8960C' : '#8E8E93',
                  marginTop: 2,
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
