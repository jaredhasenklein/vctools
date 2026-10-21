// Role text for badges: how roles are combined and shortened.

/** ["Judge", "Field Assembly"] -> "JUDGE". Field Assembly is dropped unless it's the only role. */
export function formatRole(roles) {
  const list = roles.map((r) => r.trim()).filter(Boolean);
  const kept = list.filter((r) => r.toLowerCase() !== 'field assembly');
  return (kept.length ? kept : list).map((r) => r.toUpperCase()).join(' / ');
}

// Word swaps for a single long role.
const COMMON_SWAPS = {
  MANAGER: 'MGR.',
  ADVISOR: 'ADVSR.',
  ATTENDANT: '',
  SUPERVISOR: 'SUP.',
  ASSISTANT: 'ASST.',
  " - DEAN'S LIST AWARD": '',
  ' - FIRST IMPACT AWARD': '',
};
const SMALL_WORDS = new Set(['OF', 'AND', 'THE', '&', '-', 'A']);
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** "VOLUNTEER COORDINATOR" -> "VC"; "QUEUER" stays "QUEUER". */
function initials(role) {
  const words = role.split(/\s+/).filter((w) => w && !SMALL_WORDS.has(w.toUpperCase()));
  return words.length > 1 ? words.map((w) => w[0]).join('').toUpperCase() : role;
}

/**
 * The "Insert Common Abbreviations" suggestion for a formatted role, or the role unchanged.
 * Several roles ("VOLUNTEER COORDINATOR / JUDGE ADVISOR") become initials ("VC / JA");
 * a single role gets word swaps ("JUDGE ADVISOR" -> "JUDGE ADVSR.").
 */
export function suggestAbbreviation(role) {
  const parts = role.split(' / ');
  if (parts.length > 1) return parts.map(initials).join(' / ');
  let short = role;
  for (const [word, replacement] of Object.entries(COMMON_SWAPS)) {
    short = short.replace(new RegExp(`\\b${escape(word)}\\b`, 'gi'), replacement);
  }
  return short.replace(/\s{2,}/g, ' ').trim();
}
