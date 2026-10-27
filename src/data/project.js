// Mock of a project a professional is returning to. Nodes form a lineage tree:
// every generation remembers its parent and the direction that produced it.
import { toItems } from "./generations";

const node = (id, parentId, direction, prompt, model, aspect, keys, extra = {}) => ({
  id,
  parentId,
  direction,
  prompt,
  model,
  aspect,
  type: "image",
  status: "done",
  items: toItems(id, keys),
  ...extra,
});

const BASE_PORTRAIT =
  "Portrait of Mara, early 30s, auburn hair, warm brown eyes, cream knit sweater, softly blurred gallery backdrop";

export const PROJECT = {
  id: "aurora-spring",
  name: "Spring launch",
  client: "Aurora Skincare",
  lastEdited: "Yesterday, 18:42",
  brief:
    "Fresh, honest, sun-warmed. Mara is the face of the line: natural skin, no heavy retouching. Palette stays in terracotta and cream; light is soft and directional.",
  resumeNodeId: "n4",
  nodes: [
    node("n1", null, "Mara · base look", BASE_PORTRAIT, "fomi-photoreal", "3:4", ["redhead-1", "redhead-3", "redhead-2", "redhead-4"]),
    node("n2", "n1", "Natural freckles, no makeup", `${BASE_PORTRAIT}. Natural freckles, no makeup`, "fomi-photoreal", "3:4", ["redhead-4", "redhead-2", "woman-12", "redhead-1"]),
    node("n3", "n1", "Bigger smile", `${BASE_PORTRAIT}. Bigger, genuine smile`, "fomi-photoreal", "3:4", ["redhead-2", "portrait-1", "woman-14", "woman-13"]),
    node("n4", "n3", "Golden hour window light", `${BASE_PORTRAIT}. Bigger, genuine smile. Golden hour window light`, "fomi-photoreal", "3:4", ["redhead-3", "woman-6", "woman-7", "portrait-3"]),
    node("n5", "n2", "Tighter crop, 85mm", `${BASE_PORTRAIT}. Natural freckles, no makeup. Tighter crop, 85mm`, "fomi-2", "1:1", ["redhead-4", "portrait-2", "woman-11", "woman-9"]),
    node("n6", null, "Backdrop · alpine dawn", "Spring backdrop for hero banner: alpine lake at dawn, pastel sky, calm water, generous negative space on the left", "fomi-2", "16:9", ["lake-1", "lake-2", "lake-3", "lake-4"]),
    node("n7", "n6", "Warmer, more terracotta", "Spring backdrop for hero banner: alpine lake at dawn, pastel sky, calm water, generous negative space on the left. Warmer, terracotta tones", "fomi-2", "16:9", ["coast-1", "hills-1", "valley-1", "lake-2"]),
    node("n8", null, "Story loop · blossoms", "Vertical story loop: blossoming branches swaying in a light breeze, soft natural light", "fomi-motion", "9:16", ["blossom", "waves"], { type: "video", duration: 5 }),
  ],
  slots: [
    { id: "hero", name: "Web hero", aspect: "16:9", ref: { nodeId: "n7", index: 3 } },
    { id: "pdp", name: "Product page portrait", aspect: "3:4", ref: { nodeId: "n4", index: 0 } },
    { id: "post", name: "Instagram post", aspect: "1:1", ref: null },
    { id: "story", name: "Story loop", aspect: "9:16", ref: null },
  ],
  locks: [
    { id: "character", kind: "Character", label: "Mara", hint: "Same face across every output", thumb: "redhead-1", prompt: "same woman as reference: Mara", on: true },
    { id: "palette", kind: "Palette", label: "Terracotta & cream", swatches: ["#c4653f", "#e9b99a", "#f3e6d8", "#5b4636"], prompt: "palette of terracotta and cream", on: true },
    { id: "light", kind: "Light", label: "Soft directional", hint: "Window light from the left", prompt: "soft directional window light from the left", on: false },
    { id: "lens", kind: "Lens", label: "85mm · f/2", hint: "Shallow depth of field", prompt: "shot on 85mm at f/2", on: true },
  ],
};

export const NUDGES = ["Warmer", "Closer crop", "Wider shot", "Softer light", "More contrast", "Candid moment"];
