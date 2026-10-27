// Mock "database": media themes the fake model draws from, and seeded history.
import media from "./media.json";

export const IMAGE_THEMES = [
  {
    id: "portrait",
    keywords: ["woman", "girl", "lady", "portrait", "face", "redhead", "headshot", "model", "person", "freckle"],
    media: ["redhead-1", "redhead-2", "redhead-3", "redhead-4", "portrait-1", "portrait-2", "portrait-3", "portrait-4",
      "woman-5", "woman-6", "woman-7", "woman-8", "woman-9", "woman-10", "woman-11", "woman-12", "woman-13", "woman-14"],
  },
  { id: "man", keywords: ["man", "guy", "male", "gentleman", "beard", "suit"], media: ["man-1", "man-2", "man-3", "man-4"] },
  {
    id: "landscape",
    keywords: ["lake", "mountain", "landscape", "valley", "hills", "alpine", "coast", "road", "nature", "dawn"],
    media: ["lake-1", "lake-2", "lake-3", "lake-4", "valley-1", "hills-1", "coast-1", "road-1"],
  },
  { id: "forest", keywords: ["forest", "tree", "woods", "jungle", "moss"], media: ["forest-1", "forest-2", "forest-3", "forest-4"] },
  { id: "city", keywords: ["paris", "city", "eiffel", "street", "france", "tower"], media: ["paris-1", "paris-2"] },
  { id: "space", keywords: ["space", "galaxy", "star", "planet", "cosmic", "nebula", "night sky"], media: ["space-1", "space-2", "space-3"] },
  { id: "animal", keywords: ["cat", "dog", "pet", "animal", "kitten", "puppy"], media: ["cat-1", "dog-1"] },
  { id: "abstract", keywords: ["abstract", "gradient", "color", "pattern", "wallpaper", "background"], media: ["abstract-1", "abstract-2", "abstract-3"] },
  { id: "interior", keywords: ["cinema", "film", "movie", "restaurant", "interior", "neon"], media: ["cinema-1", "cinema-2", "cinema-3"] },
  { id: "ocean", keywords: ["ocean", "sea", "wave", "surf", "beach", "flower", "snow"], media: ["surf-1", "coast-1", "flowers-1", "winter-1"] },
];

export const VIDEO_THEMES = [
  { id: "waves", keywords: ["ocean", "sea", "wave", "water", "beach"], media: ["waves"] },
  { id: "blossom", keywords: ["flower", "blossom", "spring", "branch", "tree"], media: ["blossom"] },
  { id: "sky", keywords: ["space", "star", "night", "galaxy", "sky", "milky"], media: ["milkyway"] },
  { id: "road", keywords: ["road", "car", "drive", "mountain", "travel"], media: ["mountain-road"] },
  { id: "forest", keywords: ["forest", "river", "stream", "nature", "woods"], media: ["forest-stream"] },
];

export const ALL_IMAGES = IMAGE_THEMES.flatMap((t) => t.media);
export const ALL_VIDEOS = VIDEO_THEMES.flatMap((t) => t.media);

/** Expands media keys into items the UI can render. */
export function toItems(batchId, keys) {
  return keys.map((key, i) => ({ id: `${batchId}-${i}`, ...media[key] }));
}

const seed = (id, type, prompt, model, aspect, keys, style, duration) => ({
  id,
  type,
  prompt,
  model,
  aspect,
  style: style ?? null,
  duration: duration ?? null,
  count: keys.length,
  items: toItems(id, keys),
});

// Newest first, like a real history endpoint.
export const SEED_BATCHES = [
  seed("b16", "image",
    "A professional portrait photograph of a smiling 31-year-old redheaded woman with warm brown eyes and softly tousled auburn hair framing her face. She is turned slightly towards the viewer, offering a genuine and approachable expression. She is wearing a cream-colored cashmere sweater and delicate gold earrings. The background is a softly blurred expanse of muted gray and beige tones, suggesting a modern art gallery. There is subtle directional lighting.",
    "fomi-photoreal", "3:4", ["redhead-1", "redhead-2", "redhead-3", "redhead-4"], "Studio light"),
  seed("b15", "image",
    "Editorial headshots of a woman against seamless backdrops, natural skin texture, calm confident expression, shot on 85mm at f/2, magazine cover framing.",
    "fomi-2", "3:4", ["portrait-1", "portrait-2", "portrait-3", "portrait-4"], "Editorial"),
  seed("b14", "video",
    "Slow cinematic establishing shots: the Milky Way over a ridge line, a winding mountain road at dusk, and sunlight on a forest stream. Gentle push-in camera move.",
    "fomi-motion-pro", "16:9", ["milkyway", "mountain-road", "forest-stream"], "Cinematic", 10),
  seed("b13", "image",
    "Alpine lake at dawn, glassy turquoise water reflecting jagged peaks, a lone wooden boat, crisp morning air, wide landscape photography.",
    "fomi-2", "4:3", ["lake-1", "lake-2", "lake-3", "lake-4"], "Golden hour"),
  seed("b12", "image",
    "Studio portraits of a man in his thirties, warm key light, neutral background, sharp focus on the eyes, LinkedIn-ready but with personality.",
    "fomi-photoreal", "1:1", ["man-1", "man-2", "man-3", "man-4"], "Studio light"),
  seed("b11", "video",
    "Vertical nature loops for social: gentle ocean swell and blossoming branches swaying in a light breeze, soft natural light.",
    "fomi-motion", "9:16", ["waves", "blossom"], null, 5),
  seed("b10", "image",
    "Ancient forest path with towering pines, shafts of light through morning mist, moss-covered ground, quiet and immersive.",
    "fomi-2", "1:1", ["forest-1", "forest-2", "forest-3", "forest-4"], "Moody"),
  seed("b9", "image",
    "The Eiffel Tower framed by autumn trees, soft overcast light, travel poster composition.",
    "fomi-2-turbo", "3:4", ["paris-1", "paris-2"], "Pastel"),
  seed("b8", "image",
    "Deep space: a glowing nebula, a starry night sky over mountains and Earth seen from orbit.",
    "fomi-2", "1:1", ["space-1", "space-2", "space-3"], "Cinematic"),
  seed("b7", "image",
    "Candid pet portraits, a tabby cat lounging and a happy beagle, shallow depth of field, playful.",
    "fomi-2-turbo", "1:1", ["cat-1", "dog-1"]),
  seed("b6", "image",
    "Smooth abstract gradient wallpapers in violet, coral and teal, soft grain, minimal.",
    "fomi-2-turbo", "1:1", ["abstract-1", "abstract-2", "abstract-3"], "Minimal"),
  seed("b5", "image",
    "Lifestyle portraits of young women outdoors and in the city, golden hour, relaxed and authentic.",
    "fomi-2", "3:4", ["woman-5", "woman-6", "woman-7", "woman-8"], "Golden hour"),
  seed("b4", "image",
    "Moody fashion portraits with dramatic side light and bold color backdrops.",
    "fomi-photoreal", "3:4", ["woman-9", "woman-10", "woman-11", "woman-12"], "Moody"),
  seed("b3", "image",
    "Neon cinema facade at night and a warm modern restaurant interior, film still look.",
    "fomi-2", "4:3", ["cinema-1", "cinema-2", "cinema-3"], "Film grain"),
  seed("b2", "image",
    "Wide landscapes: coastal sunset, misty hills, a green valley and a desert road vanishing into the distance.",
    "fomi-2", "16:9", ["coast-1", "hills-1", "valley-1", "road-1"], "Cinematic"),
  seed("b1", "image",
    "Seasonal moodboard: surfing a perfect wave, a field of yellow poppies and a cosy winter portrait.",
    "fomi-2-turbo", "1:1", ["surf-1", "flowers-1", "winter-1"]),
];

export const PAGE_SIZE = 5;

export function getGenerationsPage(cursor = 0, limit = PAGE_SIZE) {
  const items = SEED_BATCHES.slice(cursor, cursor + limit);
  const next = cursor + limit;
  return { items, nextCursor: next < SEED_BATCHES.length ? next : null };
}
