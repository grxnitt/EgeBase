import test from "node:test";
import assert from "node:assert/strict";
import { splitDictionaryTermText } from "../lib/dictionary-linking.ts";

const terms = [
  {
    title: "Социальная стратификация",
    slug: "social-stratification",
    aliases: ["социальной стратификации"]
  },
  {
    title: "Стратификация",
    slug: "stratification",
    aliases: []
  },
  {
    title: "Волонтёрство",
    slug: "volunteering",
    aliases: ["волонтерство"]
  }
];

test("links the longest matching dictionary term", () => {
  assert.deepEqual(splitDictionaryTermText("Признаки социальной стратификации важны.", terms), [
    { text: "Признаки ", slug: null },
    { text: "социальной стратификации", slug: "social-stratification" },
    { text: " важны.", slug: null }
  ]);
});

test("matches е query variants against ё in term aliases", () => {
  assert.deepEqual(splitDictionaryTermText("Волонтёрство связано с группами.", terms), [
    { text: "Волонтёрство", slug: "volunteering" },
    { text: " связано с группами.", slug: null }
  ]);
});

test("does not link a term inside another word", () => {
  assert.deepEqual(splitDictionaryTermText("Псевдостратификация — не термин.", terms), [
    { text: "Псевдостратификация — не термин.", slug: null }
  ]);
});
