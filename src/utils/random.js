// Weighted random selection from an array
// items: array of objects
// weightFn: function that returns weight for each item (higher = more likely)
export function weightedRandom(items, weightFn) {
  if (!items.length) return null;

  const weights = items.map(weightFn);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  if (totalWeight <= 0) return items[Math.floor(Math.random() * items.length)];

  let roll = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }

  return items[items.length - 1];
}

// Random integer between min and max (inclusive)
export function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Random float between min and max
export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

// Returns true with given probability (0-1)
export function chance(probability) {
  return Math.random() < probability;
}

// Shuffle array (Fisher-Yates)
export function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Pick random item from array
export function pickRandom(array) {
  if (!array.length) return null;
  return array[Math.floor(Math.random() * array.length)];
}
