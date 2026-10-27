// Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { interruptPending, load, mergeBatches, save, stripFresh } from "./storage.js";

test("mergeBatches puts saved first and drops duplicates", () => {
  const merged = mergeBatches([{ id: "p2" }, { id: "b1" }], [{ id: "b1" }, { id: "b0" }]);
  assert.deepEqual(merged.map((b) => b.id), ["p2", "b1", "b0"]);
});

test("interruptPending turns in-flight nodes into retryable errors", () => {
  const [done, pending] = interruptPending([{ id: "a", status: "done" }, { id: "b", status: "pending" }]);
  assert.equal(done.status, "done");
  assert.equal(pending.status, "error");
  assert.ok(pending.error);
});

test("stripFresh removes only the animation flag", () => {
  assert.deepEqual(stripFresh({ id: "p1", fresh: true, items: [] }), { id: "p1", items: [] });
});

test("load/save fall back silently without localStorage", () => {
  assert.equal(load("k", 7), 7);
  assert.doesNotThrow(() => save("k", 1));
});
