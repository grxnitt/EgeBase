import test from "node:test";
import assert from "node:assert/strict";
import { splitHighlightedText } from "../lib/search-highlight.ts";

test("splits text into highlighted and plain parts", () => {
  assert.deepEqual(splitHighlightedText("Социальная стратификация", "стратиф"), [
    { text: "Социальная ", highlighted: false },
    { text: "стратиф", highlighted: true },
    { text: "икация", highlighted: false }
  ]);
});

test("matches е query against ё in source text", () => {
  assert.deepEqual(splitHighlightedText("волонтёрское движение", "волонтер"), [
    { text: "волонтёр", highlighted: true },
    { text: "ское движение", highlighted: false }
  ]);
});

test("does not highlight single-letter queries", () => {
  assert.deepEqual(splitHighlightedText("Главная", "а"), [{ text: "Главная", highlighted: false }]);
});

test("does not highlight service words", () => {
  assert.deepEqual(splitHighlightedText("Человек и общество", "и"), [
    { text: "Человек и общество", highlighted: false }
  ]);
});
