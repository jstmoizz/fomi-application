// Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { matchTheme, pickMedia, hashString } from "./mock-engine.js";

const themes = [
  { id: "portrait", keywords: ["woman", "portrait"], media: ["p1", "p2"] },
  { id: "space", keywords: ["galaxy", "star"], media: ["s1", "s2", "s3"] },
];

test("matches the theme with the most keyword hits", () => {
  assert.equal(matchTheme("A portrait of a woman", themes, 0).id, "portrait");
  assert.equal(matchTheme("star field in a galaxy", themes, 0).id, "space");
});

test("falls back to a seeded theme when nothing matches", () => {
  assert.equal(matchTheme("zzz", themes, 1).id, "space");
});

test("picks unique media, tops up from fallback, is deterministic", () => {
  const a = pickMedia(themes[0], 4, 42, ["p1", "x1", "x2"]);
  assert.equal(a.length, 4);
  assert.equal(new Set(a).size, 4);
  assert.deepEqual(a.slice(0, 2).sort(), ["p1", "p2"]);
  assert.deepEqual(a, pickMedia(themes[0], 4, 42, ["p1", "x1", "x2"]));
});

test("hashString is stable", () => {
  assert.equal(hashString("fomi"), hashString("fomi"));
  assert.notEqual(hashString("fomi"), hashString("fomj"));
});
