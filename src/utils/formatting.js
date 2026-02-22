// Format age display: "Age 25" or "Newborn" for age 0
export function formatAge(age) {
  if (age === 0) return 'Newborn';
  return `Age ${age}`;
}

// Format year display
export function formatYear(birthYear, age) {
  return `${birthYear + age}`;
}

// Format stat value as percentage string
export function formatStat(value, max = 100) {
  const pct = Math.round((value / max) * 100);
  return `${Math.max(0, Math.min(100, pct))}%`;
}

// Format karma for display (no raw numbers - use descriptive text)
export function formatKarma(karma) {
  if (karma >= 90) return 'Enlightened';
  if (karma >= 75) return 'Virtuous';
  if (karma >= 60) return 'Good';
  if (karma >= 45) return 'Neutral';
  if (karma >= 30) return 'Troubled';
  if (karma >= 15) return 'Corrupt';
  return 'Wicked';
}

// Capitalize first letter
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Get life stage display name
export function formatLifeStage(stage) {
  const stages = {
    infant: 'Infant',
    toddler: 'Toddler',
    child: 'Child',
    preteen: 'Pre-Teen',
    teen: 'Teenager',
    young_adult: 'Young Adult',
    adult: 'Adult',
    middle_aged: 'Middle-Aged',
    senior: 'Senior',
    elderly: 'Elderly',
  };
  return stages[stage] || capitalize(String(stage).replace(/_/g, ' '));
}

// Get country display name with flag
export function formatCountry(countryId) {
  const countries = {
    us: { name: 'United States', flag: '\u{1F1FA}\u{1F1F8}' },
    uk: { name: 'United Kingdom', flag: '\u{1F1EC}\u{1F1E7}' },
    ca: { name: 'Canada', flag: '\u{1F1E8}\u{1F1E6}' },
    au: { name: 'Australia', flag: '\u{1F1E6}\u{1F1FA}' },
    de: { name: 'Germany', flag: '\u{1F1E9}\u{1F1EA}' },
    fr: { name: 'France', flag: '\u{1F1EB}\u{1F1F7}' },
    jp: { name: 'Japan', flag: '\u{1F1EF}\u{1F1F5}' },
    br: { name: 'Brazil', flag: '\u{1F1E7}\u{1F1F7}' },
    in: { name: 'India', flag: '\u{1F1EE}\u{1F1F3}' },
    cn: { name: 'China', flag: '\u{1F1E8}\u{1F1F3}' },
    mx: { name: 'Mexico', flag: '\u{1F1F2}\u{1F1FD}' },
    kr: { name: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}' },
    it: { name: 'Italy', flag: '\u{1F1EE}\u{1F1F9}' },
    es: { name: 'Spain', flag: '\u{1F1EA}\u{1F1F8}' },
    ng: { name: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}' },
    za: { name: 'South Africa', flag: '\u{1F1FF}\u{1F1E6}' },
    se: { name: 'Sweden', flag: '\u{1F1F8}\u{1F1EA}' },
    no: { name: 'Norway', flag: '\u{1F1F3}\u{1F1F4}' },
    ru: { name: 'Russia', flag: '\u{1F1F7}\u{1F1FA}' },
    eg: { name: 'Egypt', flag: '\u{1F1EA}\u{1F1EC}' },
    th: { name: 'Thailand', flag: '\u{1F1F9}\u{1F1ED}' },
    id: { name: 'Indonesia', flag: '\u{1F1EE}\u{1F1E9}' },
    ar: { name: 'Argentina', flag: '\u{1F1E6}\u{1F1F7}' },
    ie: { name: 'Ireland', flag: '\u{1F1EE}\u{1F1EA}' },
    nl: { name: 'Netherlands', flag: '\u{1F1F3}\u{1F1F1}' },
  };

  const country = countries[countryId];
  if (!country) return countryId;
  return `${country.flag} ${country.name}`;
}

// Truncate text with ellipsis
export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength - 1).trimEnd() + '\u2026';
}
