// Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileName } from "./files.js";

test("fileName slugs the label, numbers from 1 and keeps the extension", () => {
  assert.equal(fileName("A professional portrait, of a smiling woman!", 1, "/media/img/portrait-1.jpg"), "fomi-a-professional-portrait-of-a-2.jpg");
  assert.equal(fileName("Web hero 16:9", null, "/media/video/clip.mp4"), "fomi-web-hero-16-9.mp4");
  assert.equal(fileName("—", 0, "/x.webp"), "fomi-export-1.webp");
});
