// Pure "fake model" logic for the mock API: picks media that fits a prompt.
// Kept free of Next/JSON imports so it can be tested with plain `node --test`.

export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Small deterministic PRNG so the same seed always yields the same picks.
function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Returns the theme whose keywords best match the prompt, or a seeded fallback. */
export function matchTheme(prompt, themes, seed) {
  const words = prompt.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const theme of themes) {
    const score = theme.keywords.filter((k) => words.includes(k)).length;
    if (score > bestScore) {
      best = theme;
      bestScore = score;
    }
  }
  return best ?? themes[seed % themes.length];
}

/** Picks `count` media keys from the theme, topping up from `fallback` if the theme is small. */
export function pickMedia(theme, count, seed, fallback = []) {
  const rand = mulberry32(seed);
  const shuffle = (arr) =>
    arr
      .map((v) => [rand(), v])
      .sort((a, b) => a[0] - b[0])
      .map(([, v]) => v);
  const pool = shuffle(theme.media);
  const extra = shuffle(fallback.filter((m) => !pool.includes(m)));
  return [...pool, ...extra].slice(0, count);
}
