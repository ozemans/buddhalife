import { useState, useMemo } from 'react';
import { highlightTerms } from '../../utils/termHighlighter';
import TermTooltip from '../ui/TermTooltip';

const TAG_EMOJI_MAP = {
  spiritual: '\uD83D\uDE4F',
  ordination: '\uD83D\uDE4F',
  monastery: '\uD83C\uDFDB\uFE0F',
  temple: '\uD83C\uDFDB\uFE0F',
  merit: '\u2638\uFE0F',
  dharma: '\u2638\uFE0F',
  financial: '\uD83D\uDCB0',
  wealth: '\uD83D\uDCB0',
  commerce: '\uD83D\uDCB0',
  gambling: '\uD83D\uDCB0',
  relationship: '\u2764\uFE0F',
  family: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67',
  health: '\uD83C\uDFE5',
  healing: '\uD83C\uDFE5',
  education: '\uD83D\uDCDA',
  moral: '\u2696\uFE0F',
  festival: '\uD83C\uDF89',
  death: '\uD83D\uDE4F',
  funeral: '\uD83D\uDE4F',
  spirits: '\uD83D\uDE4F',
  political: '\uD83D\uDDF3\uFE0F',
  environment: '\uD83C\uDF33',
  aging: '\uD83E\uDDD3',
  community: '\uD83D\uDC65',
  addiction: '\u26A0\uFE0F',
  identity: '\uD83D\uDC64',
  food: '\uD83C\uDF5A',
  generosity: '\uD83E\uDD1D',
  tradition: '\uD83C\uDF89',
};

const TITLE_KEYWORD_EMOJI = [
  [/temple|monastery|ordain/i, '\uD83C\uDFDB\uFE0F'],
  [/spirit|ghost|phi|shrine/i, '\uD83D\uDE4F'],
  [/death|funeral|cremation|dying/i, '\uD83D\uDE4F'],
  [/heal|sick|fever|illness/i, '\uD83C\uDFE5'],
  [/school|education|study|teach/i, '\uD83D\uDCDA'],
  [/money|wealth|gambl|vendor|market|sell/i, '\uD83D\uDCB0'],
  [/family|parent|child|son|daughter/i, '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67'],
  [/forest|tree|environment|logging/i, '\uD83C\uDF33'],
  [/festival|songkran|ceremony|celebration/i, '\uD83C\uDF89'],
  [/amulet|meditation|karma|precept/i, '\u2638\uFE0F'],
  [/food|eat|rice|meal/i, '\uD83C\uDF5A'],
  [/hunt|fish|animal/i, '\uD83C\uDF3F'],
  [/oath|sobriety|drink/i, '\u26A0\uFE0F'],
  [/transgender|katoey|identity/i, '\uD83D\uDC64'],
  [/elder|aging|old/i, '\uD83E\uDDD3'],
  [/water|songkran/i, '\uD83D\uDCA7'],
];

const CHOICE_EMOJIS = [
  '\uD83D\uDE4F', // pray hands
  '\uD83D\uDCAD', // thought
  '\uD83C\uDFAF', // target
  '\uD83D\uDD2E', // crystal ball
];

const CHOICE_CONTEXTUAL_MAP = [
  [/pray|temple|monk|ordain|spiritual|meditat|chant|precept/i, '\uD83D\uDE4F'],
  [/share|give|generous|offer|donate|sponsor/i, '\uD83E\uDD1D'],
  [/money|buy|sell|save|invest|gamble|bet|cost/i, '\uD83D\uDCB0'],
  [/run|flee|escape|hide|avoid|skip|refuse/i, '\uD83C\uDFC3'],
  [/fight|throw|angry|defy|rebel|resist/i, '\uD83D\uDCA2'],
  [/family|parent|mother|father|child|home/i, '\u2764\uFE0F'],
  [/study|learn|school|read|education/i, '\uD83D\uDCDA'],
  [/eat|food|cook|feast|meal/i, '\uD83C\uDF5A'],
  [/work|farm|labor|field|fish|hunt/i, '\uD83D\uDCAA'],
  [/help|volunteer|join|support|accept/i, '\u2B50'],
  [/wait|delay|later|postpone/i, '\u23F3'],
  [/talk|joke|laugh|negotiate|compromise/i, '\uD83D\uDDE3\uFE0F'],
  [/heal|cure|remedy|treat/i, '\uD83C\uDFE5'],
  [/quiet|calm|control|composed/i, '\uD83E\uDDD8'],
];

function getEventEmoji(event) {
  // Check tags first
  if (event.tags && event.tags.length > 0) {
    for (const tag of event.tags) {
      if (TAG_EMOJI_MAP[tag]) return TAG_EMOJI_MAP[tag];
    }
  }
  // Fall back to title keyword matching
  const title = event.title || '';
  for (const [pattern, emoji] of TITLE_KEYWORD_EMOJI) {
    if (pattern.test(title)) return emoji;
  }
  return '\uD83D\uDCDC'; // scroll as default
}

function getChoiceEmoji(choiceText, index) {
  const text = choiceText || '';
  for (const [pattern, emoji] of CHOICE_CONTEXTUAL_MAP) {
    if (pattern.test(text)) return emoji;
  }
  return CHOICE_EMOJIS[index % CHOICE_EMOJIS.length];
}

function getStatEmoji(key) {
  const map = {
    karma: '\u2638\uFE0F',
    merit: '\u2638\uFE0F',
    demerit: '\u2638\uFE0F',
    health: '\u2764\uFE0F',
    happiness: '\uD83D\uDE0A',
    wealth: '\uD83D\uDCB0',
    wisdom: '\uD83E\uDDE0',
    socialStatus: '\uD83D\uDC65',
    socialStanding: '\uD83D\uDC65',
    spiritualDev: '\uD83D\uDE4F',
    education: '\uD83D\uDCDA',
  };
  return map[key] || '\uD83D\uDCCA';
}

function getKarmaHint(choice) {
  const karma = choice?.effects?.karma;
  if (!karma) return null;
  const merit = karma.merit || 0;
  const demerit = karma.demerit || 0;
  if (merit === 0 && demerit === 0) return null;
  if (merit > 0 && demerit === 0) return { symbol: '☸️', color: '#34C759', label: 'Virtuous' };
  if (demerit > 0 && merit === 0) return { symbol: '⚠️', color: '#FF9500', label: 'Unwholesome' };
  if (merit > 0 && demerit > 0) return { symbol: '⚖️', color: '#8E8E93', label: 'Complex' };
  return null;
}

/**
 * Personalize event text by replacing generic terms with NPC names.
 * Only replaces the first occurrence of each pattern to keep text natural.
 */
function personalizeText(text, relationships, eventTags) {
  if (!text || !relationships || relationships.length === 0) return text;

  let result = text;
  const alive = relationships.filter(r => r.alive !== false);

  // Find specific NPCs by role
  const mother = alive.find(r => r.role === 'mother');
  const father = alive.find(r => r.role === 'father');
  const monk = alive.find(r => r.type === 'mentor' && r.role === 'monk');
  const sibling = alive.find(r => r.role === 'sibling');
  const friend = alive.find(r => r.type === 'friend');

  // Replace generic mentions with personalized versions (first occurrence only)
  if (mother) {
    result = result.replace(/\byour mother\b/i, `your mother, ${mother.name},`);
    result = result.replace(/\bYour mother\b/, `Your mother, ${mother.name},`);
  }
  if (father) {
    result = result.replace(/\byour father\b/i, `your father, ${father.name},`);
    result = result.replace(/\bYour father\b/, `Your father, ${father.name},`);
  }
  if (monk) {
    result = result.replace(/\ba monk\b/, `${monk.name}, a monk`);
    result = result.replace(/\bthe monk\b/, `${monk.name}`);
    result = result.replace(/\bThe monk\b/, `${monk.name}`);
  }
  if (sibling) {
    result = result.replace(/\byour sibling\b/i, `your sibling, ${sibling.name},`);
    result = result.replace(/\byour brother\b/i, `your ${sibling.description === 'Your brother' ? 'brother' : 'sibling'}, ${sibling.name},`);
    result = result.replace(/\byour sister\b/i, `your ${sibling.description === 'Your sister' ? 'sister' : 'sibling'}, ${sibling.name},`);
  }
  if (friend) {
    result = result.replace(/\byour friend\b/i, `your friend, ${friend.name},`);
    result = result.replace(/\bYour friend\b/, `Your friend, ${friend.name},`);
  }

  return result;
}

function extractStatChanges(choice) {
  const changes = [];
  if (!choice || !choice.effects) return changes;

  const { effects } = choice;

  // Karma
  if (effects.karma) {
    if (effects.karma.merit && effects.karma.merit !== 0) {
      changes.push({
        key: 'merit',
        label: 'Merit',
        value: effects.karma.merit,
      });
    }
    if (effects.karma.demerit && effects.karma.demerit !== 0) {
      changes.push({
        key: 'demerit',
        label: 'Demerit',
        value: -effects.karma.demerit,
      });
    }
  }

  // Stats
  if (effects.stats) {
    Object.entries(effects.stats).forEach(([key, value]) => {
      if (value !== 0) {
        changes.push({
          key,
          label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
          value,
        });
      }
    });
  }

  return changes;
}

export default function EventCard({ event, onChoice, relationships }) {
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showOutcome, setShowOutcome] = useState(false);

  const rawBodyText = showOutcome && selectedChoice?.outcomeText
    ? selectedChoice.outcomeText
    : (event?.description || '');
  const bodyText = personalizeText(rawBodyText, relationships, event?.tags);
  const bodySegments = useMemo(() => highlightTerms(bodyText), [bodyText]);

  if (!event) return null;

  const eventEmoji = getEventEmoji(event);

  const handleChoice = (choice) => {
    setSelectedChoice(choice);
    setShowOutcome(true);
  };

  const handleContinue = () => {
    onChoice(selectedChoice.id);
    setSelectedChoice(null);
    setShowOutcome(false);
  };

  const statChanges = selectedChoice ? extractStatChanges(selectedChoice) : [];

  return (
    <div style={{ width: '100%', maxWidth: 600, margin: '0 auto' }}>
      {/* Event title */}
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#1D1D1F',
          letterSpacing: '-0.02em',
          marginBottom: 16,
          lineHeight: 1.3,
        }}
      >
        <span style={{ marginRight: 8, fontSize: 22 }}>{eventEmoji}</span>
        {event.title}
      </div>

      {/* Body text */}
      <p
        style={{
          fontSize: 16,
          fontWeight: 400,
          color: '#1D1D1F',
          lineHeight: 1.6,
          marginBottom: 24,
        }}
      >
        {bodySegments.map((segment, i) =>
          segment.type === 'term' ? (
            <TermTooltip
              key={i}
              term={segment.entry.term}
              translation={segment.entry.translation}
              description={segment.entry.description}
            >
              {segment.content}
            </TermTooltip>
          ) : (
            <span key={i}>{segment.content}</span>
          )
        )}
      </p>

      {/* Stat change indicators (shown after choosing) */}
      {showOutcome && statChanges.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 20,
            animation: 'slide-up-fade 0.3s ease-out',
          }}
        >
          {statChanges.map((change, i) => (
            <span
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 600,
                backgroundColor: change.value > 0 ? '#E8F5E9' : '#FFEBEE',
                color: change.value > 0 ? '#34C759' : '#FF3B30',
                animation: 'slide-up-fade 0.3s ease-out',
                animationDelay: `${i * 0.08}s`,
                animationFillMode: 'backwards',
              }}
            >
              {getStatEmoji(change.key)}{' '}
              {change.value > 0 ? '+' : ''}
              {change.value}
            </span>
          ))}
        </div>
      )}

      {/* Choices or Continue */}
      {!showOutcome ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {event.choices?.map((choice, index) => (
            <button
              key={choice.id}
              onClick={() => handleChoice(choice)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '14px 18px',
                minHeight: 48,
                borderRadius: 12,
                backgroundColor: '#F2F2F7',
                border: '1px solid #D1D1D6',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 500,
                color: '#1D1D1F',
                lineHeight: 1.4,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'transform 150ms ease-out, background-color 150ms ease-out',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.97)';
                e.currentTarget.style.backgroundColor = '#E5E5EA';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = '#F2F2F7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = '#F2F2F7';
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.97)';
                e.currentTarget.style.backgroundColor = '#E5E5EA';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = '#F2F2F7';
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>
                {getChoiceEmoji(choice.text, index)}
              </span>
              <span>{choice.text}</span>
              {(() => {
                const hint = getKarmaHint(choice);
                return hint ? (
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: 11,
                    color: hint.color,
                    fontWeight: 500,
                    opacity: 0.7,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    <span style={{ fontSize: 14 }}>{hint.symbol}</span>
                  </span>
                ) : null;
              })()}
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={handleContinue}
          style={{
            width: '100%',
            minHeight: 48,
            padding: '14px 18px',
            borderRadius: 12,
            backgroundColor: '#E8960C',
            border: 'none',
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 600,
            color: '#FFFFFF',
            transition: 'transform 150ms ease-out',
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.97)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.97)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Continue
        </button>
      )}
    </div>
  );
}
