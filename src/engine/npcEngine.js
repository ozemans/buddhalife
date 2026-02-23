// Country-appropriate name pools (~8 male + 8 female per country)
const NAME_POOLS = {
  thailand: {
    male: ['Somchai', 'Prasert', 'Wichai', 'Anon', 'Narong', 'Boonmee', 'Kittisak', 'Surasak'],
    female: ['Suda', 'Malai', 'Noi', 'Pranee', 'Wilai', 'Kanya', 'Supatra', 'Duangjai'],
  },
  myanmar: {
    male: ['Aung', 'Kyaw', 'Zaw', 'Htun', 'Myint', 'Thura', 'Naing', 'Myo'],
    female: ['Aye', 'Thin', 'Khin', 'May', 'Nwe', 'Su', 'Phyu', 'Wai'],
  },
  cambodia: {
    male: ['Sokha', 'Dara', 'Vibol', 'Rith', 'Pheakdey', 'Bopha', 'Kosal', 'Sovann'],
    female: ['Chantrea', 'Sreymom', 'Kunthea', 'Rachana', 'Mealea', 'Sophea', 'Theary', 'Vanna'],
  },
  vietnam: {
    male: ['Minh', 'Duc', 'Thanh', 'Hieu', 'Quang', 'Tuan', 'Trung', 'Phong'],
    female: ['Lan', 'Huong', 'Mai', 'Linh', 'Thao', 'Ngoc', 'Hanh', 'Tuyet'],
  },
  laos: {
    male: ['Somphone', 'Khamla', 'Bounmy', 'Sengdao', 'Vilay', 'Thongkham', 'Keo', 'Outhit'],
    female: ['Khamphone', 'Bouachanh', 'Daovanh', 'Chansouk', 'Vanthong', 'Manivanh', 'Souliya', 'Phonesavanh'],
  },
};

// Monk/mentor name pools (gender-neutral or male, since Theravada monks are male)
const MONK_NAMES = {
  thailand: ['Phra Somchai', 'Luang Pho Boon', 'Phra Ajahn Tawee', 'Phra Kru Wisit'],
  myanmar: ['Sayadaw U Pandita', 'U Nyanissara', 'Ashin Sandima', 'U Kovida'],
  cambodia: ['Lok Kru Dhammo', 'Preah Bhikkhu Sumedho', 'Lok Kru Sokhon', 'Achar Vannak'],
  vietnam: ['Thay Minh Hanh', 'Su Ong Duc Nhien', 'Thay Quang Thanh', 'Thich Hue Phap'],
  laos: ['Ajahn Khamtan', 'Phra Khu Bounpheng', 'Ajahn Somphet', 'Phra Khu Singkham'],
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickName(country, gender) {
  const pool = NAME_POOLS[country] || NAME_POOLS.thailand;
  const list = gender === 'female' ? pool.female : pool.male;
  return pickRandom(list);
}

function pickUniqueName(country, gender, usedNames) {
  const pool = NAME_POOLS[country] || NAME_POOLS.thailand;
  const list = gender === 'female' ? pool.female : pool.male;
  const available = list.filter(n => !usedNames.has(n));
  if (available.length === 0) return pickRandom(list);
  return pickRandom(available);
}

let npcIdCounter = 0;

/**
 * Generate starting NPCs for a new character.
 * Returns 3-5 NPCs: mother, father, village monk, and optionally a sibling or friend.
 */
export function generateStartingNPCs(country, background) {
  npcIdCounter = 0;
  const usedNames = new Set();
  const npcs = [];

  // Mother
  const motherName = pickUniqueName(country, 'female', usedNames);
  usedNames.add(motherName);
  npcs.push({
    id: `npc_${++npcIdCounter}`,
    name: motherName,
    type: 'family',
    role: 'mother',
    affinity: 80,
    description: 'Your mother',
    alive: true,
  });

  // Father
  const fatherName = pickUniqueName(country, 'male', usedNames);
  usedNames.add(fatherName);
  npcs.push({
    id: `npc_${++npcIdCounter}`,
    name: fatherName,
    type: 'family',
    role: 'father',
    affinity: 75,
    description: 'Your father',
    alive: true,
  });

  // Village/Neighborhood monk
  const monkPool = MONK_NAMES[country] || MONK_NAMES.thailand;
  const monkName = pickRandom(monkPool);
  npcs.push({
    id: `npc_${++npcIdCounter}`,
    name: monkName,
    type: 'mentor',
    role: 'monk',
    affinity: 60,
    description: 'The local monk who watches over your community',
    alive: true,
  });

  // ~50% chance of a sibling
  if (Math.random() < 0.5) {
    const siblingGender = Math.random() < 0.5 ? 'male' : 'female';
    const siblingName = pickUniqueName(country, siblingGender, usedNames);
    usedNames.add(siblingName);
    npcs.push({
      id: `npc_${++npcIdCounter}`,
      name: siblingName,
      type: 'family',
      role: 'sibling',
      affinity: 70,
      description: siblingGender === 'male' ? 'Your brother' : 'Your sister',
      alive: true,
    });
  }

  // ~40% chance of a childhood friend
  if (Math.random() < 0.4) {
    const friendGender = Math.random() < 0.5 ? 'male' : 'female';
    const friendName = pickUniqueName(country, friendGender, usedNames);
    usedNames.add(friendName);
    npcs.push({
      id: `npc_${++npcIdCounter}`,
      name: friendName,
      type: 'friend',
      role: 'childhood_friend',
      affinity: 65,
      description: 'A childhood friend from your neighborhood',
      alive: true,
    });
  }

  return npcs;
}

/**
 * Given current relationships and event tags, return an NPC that could
 * be mentioned in the event. Returns null if no match.
 */
export function getNPCForEvent(relationships, eventTags) {
  if (!relationships || !Array.isArray(relationships) || relationships.length === 0) return null;
  if (!eventTags || !Array.isArray(eventTags) || eventTags.length === 0) return null;

  const tagStr = eventTags.join(' ').toLowerCase();
  const alive = relationships.filter(r => r.alive !== false);
  if (alive.length === 0) return null;

  // Family tags
  if (/family|parent|child|mother|father|sibling/.test(tagStr)) {
    const familyNPCs = alive.filter(r => r.type === 'family');
    if (familyNPCs.length > 0) return pickRandom(familyNPCs);
  }

  // Spiritual/temple tags
  if (/spiritual|temple|monastery|monk|ordination|meditation|dharma|merit/.test(tagStr)) {
    const mentorNPCs = alive.filter(r => r.type === 'mentor');
    if (mentorNPCs.length > 0) return pickRandom(mentorNPCs);
  }

  // Relationship/community tags
  if (/relationship|community|friend|social|village/.test(tagStr)) {
    const friendNPCs = alive.filter(r => r.type === 'friend');
    if (friendNPCs.length > 0) return pickRandom(friendNPCs);
    // Fall back to family if no friends
    const familyNPCs = alive.filter(r => r.type === 'family');
    if (familyNPCs.length > 0) return pickRandom(familyNPCs);
  }

  return null;
}

/**
 * Age NPCs each year. Small chance (~3%) that a family NPC dies,
 * increasing when the player is older (parents more likely to die when player is 40+).
 * Returns { relationships, deathNotification }.
 */
export function ageNPCs(relationships, playerAge) {
  if (!relationships || !Array.isArray(relationships)) {
    return { relationships: relationships || [], deathNotification: null };
  }

  const updated = relationships.map(r => ({ ...r }));
  let deathNotification = null;

  for (const npc of updated) {
    if (!npc.alive) continue;
    if (npc.type !== 'family') continue;

    let deathChance = 0.03;

    // Parents die more often when player is older
    if ((npc.role === 'mother' || npc.role === 'father') && playerAge >= 40) {
      deathChance = 0.06;
    }
    if ((npc.role === 'mother' || npc.role === 'father') && playerAge >= 55) {
      deathChance = 0.10;
    }

    if (Math.random() < deathChance) {
      npc.alive = false;
      const roleLabel = npc.role === 'mother' ? 'mother'
        : npc.role === 'father' ? 'father'
        : npc.role === 'sibling' ? 'sibling'
        : 'family member';
      deathNotification = `Your ${roleLabel}, ${npc.name}, has passed away. The community gathers to honor their memory with prayers and merit-making.`;
      break; // Only one death per year
    }
  }

  return { relationships: updated, deathNotification };
}
