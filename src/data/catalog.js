// Static product catalog shared by the UI and the mock API.

export const MODES = [
  { id: "image", label: "Image" },
  { id: "video", label: "Video" },
];

export const MODELS = {
  image: [
    { id: "fomi-2", name: "Fomi 2", hint: "Balanced quality and speed" },
    { id: "fomi-2-turbo", name: "Fomi 2 Turbo", hint: "Fast drafts, 4× cheaper" },
    { id: "fomi-photoreal", name: "Photoreal", hint: "Skin, fabric and light detail" },
  ],
  video: [
    { id: "fomi-motion", name: "Fomi Motion", hint: "Smooth camera moves" },
    { id: "fomi-motion-pro", name: "Motion Pro", hint: "Longer, cinematic shots" },
  ],
};

export const ASPECTS = {
  image: ["1:1", "3:4", "4:3", "16:9", "9:16"],
  video: ["16:9", "9:16", "1:1"],
};

export const COUNTS = { image: [1, 2, 3, 4], video: [1, 2] };
export const DURATIONS = [5, 10];

export const STYLES = [
  "Cinematic",
  "Editorial",
  "Film grain",
  "Studio light",
  "Golden hour",
  "Moody",
  "Pastel",
  "Minimal",
];

export const DEFAULT_SETTINGS = {
  image: { model: "fomi-2", aspect: "3:4", count: 4 },
  video: { model: "fomi-motion", aspect: "16:9", count: 1, duration: 5 },
};

export const PROMPT_MAX = 1000;

export function modelName(id) {
  return [...MODELS.image, ...MODELS.video].find((m) => m.id === id)?.name ?? id;
}
