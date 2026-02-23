import glossary from '../content/glossary.json';

// Build lookup map: lowercase term/pali -> glossary entry
const termLookup = {};
glossary.forEach((entry) => {
  if (entry.term && entry.term.length > 2) {
    termLookup[entry.term.toLowerCase()] = entry;
  }
  // Add pali as separate key if different from term
  if (entry.pali && entry.pali.length > 2 && entry.pali.toLowerCase() !== entry.term.toLowerCase()) {
    termLookup[entry.pali.toLowerCase()] = entry;
  }
});

// Sort keys by length descending so longer terms match first
// e.g. "merit transfer" matches before "merit"
const sortedTerms = Object.keys(termLookup).sort((a, b) => b.length - a.length);

// Build a single regex that matches any glossary term (whole words, case-insensitive)
// Escape special regex characters in terms
const escaped = sortedTerms.map((t) =>
  t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
);
const termPattern = escaped.length > 0
  ? new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi')
  : null;

/**
 * Takes a plain text string and returns an array of segments:
 *   { type: 'text', content: '...' }
 *   { type: 'term', content: '...', entry: glossaryEntry }
 *
 * Matches whole words only, case-insensitive, longer terms first.
 */
export function highlightTerms(text) {
  if (!text || !termPattern) {
    return [{ type: 'text', content: text || '' }];
  }

  const segments = [];
  let lastIndex = 0;

  // Reset regex state
  termPattern.lastIndex = 0;

  let match;
  while ((match = termPattern.exec(text)) !== null) {
    const matchStart = match.index;
    const matchedText = match[0];
    const entry = termLookup[matchedText.toLowerCase()];

    if (!entry) continue;

    // Add any text before this match
    if (matchStart > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, matchStart) });
    }

    // Add the matched term
    segments.push({ type: 'term', content: matchedText, entry });

    lastIndex = matchStart + matchedText.length;
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  // If no matches were found, return the whole text
  if (segments.length === 0) {
    return [{ type: 'text', content: text }];
  }

  return segments;
}
