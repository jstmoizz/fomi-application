import { ASPECTS, COUNTS, DURATIONS, MODELS, PROMPT_MAX, STYLES } from "@/data/catalog";
import {
  ALL_IMAGES,
  ALL_VIDEOS,
  IMAGE_THEMES,
  VIDEO_THEMES,
  getGenerationsPage,
  toItems,
} from "@/data/generations";
import { hashString, matchTheme, pickMedia } from "@/lib/mock-engine";

// GET /api/generations?cursor=0&limit=5  → { items, nextCursor }
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.has("fail")) return Response.json({ error: "Simulated failure" }, { status: 500 });

  const cursor = Math.max(0, parseInt(searchParams.get("cursor") ?? "0", 10) || 0);
  const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") ?? "5", 10) || 5));
  await sleep(400 + Math.random() * 400);
  return Response.json(getGenerationsPage(cursor, limit));
}

// POST /api/generations  { type, prompt, model, aspect, count, duration?, style?, negativePrompt?, seed? }
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body must be JSON" }, { status: 400 });
  }

  const error = validate(body);
  if (error) return Response.json({ error }, { status: 422 });
  if (new URL(request.url).searchParams.has("fail")) {
    await sleep(1200);
    return Response.json({ error: "The model is busy. Try again in a moment." }, { status: 503 });
  }

  const { type, prompt, model, aspect, count, duration = null, style = null } = body;
  const seed = Number.isInteger(body.seed) ? body.seed : hashString(prompt + Date.now());
  const isVideo = type === "video";
  const theme = matchTheme(prompt, isVideo ? VIDEO_THEMES : IMAGE_THEMES, seed);
  const keys = pickMedia(theme, count, seed, isVideo ? ALL_VIDEOS : ALL_IMAGES);

  // Videos "render" slower than images, like the real thing.
  await sleep((isVideo ? 2600 : 1400) + Math.random() * 1200);

  const id = `g${Date.now().toString(36)}${(seed % 1296).toString(36)}`;
  return Response.json(
    { id, type, prompt: prompt.trim(), model, aspect, count, duration, style, seed, items: toItems(id, keys) },
    { status: 201 },
  );
}

function validate(b) {
  if (!b || typeof b !== "object") return "Invalid request";
  if (!["image", "video"].includes(b.type)) return "type must be image or video";
  if (typeof b.prompt !== "string" || !b.prompt.trim()) return "Prompt is required";
  if (b.prompt.length > PROMPT_MAX) return `Prompt must be under ${PROMPT_MAX} characters`;
  if (!MODELS[b.type].some((m) => m.id === b.model)) return "Unknown model";
  if (!ASPECTS[b.type].includes(b.aspect)) return "Unsupported aspect ratio";
  if (!COUNTS[b.type].includes(b.count)) return "Unsupported output count";
  if (b.type === "video" && !DURATIONS.includes(b.duration)) return "Unsupported duration";
  if (b.style != null && !STYLES.includes(b.style)) return "Unknown style";
  return null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
