import assert from "node:assert/strict";
import { parseCollection } from "../src/data/comparison.ts";

const allowed = new Set(["berlin/2023", "berlin/2026", "hamburg/2025"]);
assert.deepEqual(parseCollection(null, allowed), []);
assert.deepEqual(parseCollection("[]", allowed), []);
assert.deepEqual(
  parseCollection(JSON.stringify(["berlin/2023", "berlin/2023", "hamburg/2025", "berlin/2026"]), allowed),
  ["berlin/2023", "hamburg/2025", "berlin/2026"],
);
assert.deepEqual(
  parseCollection(JSON.stringify([null, 2023, {}, "missing/2020", "//example.com", "<script>", "berlin/2023"]), allowed),
  ["berlin/2023"],
);
for (const invalid of ["{", "null", "{}", '"berlin/2023"', "123"]) {
  assert.throws(() => parseCollection(invalid, allowed));
}
assert.deepEqual(parseCollection('["berlin/2023"]', new Set()), []);
console.log("Verified collection parsing, deduplication, order, stale IDs, and untrusted storage.");
