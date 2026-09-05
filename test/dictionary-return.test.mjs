import test from "node:test";
import assert from "node:assert/strict";
import {
  buildDictionaryTermHrefWithReturn,
  getSafeDictionaryReturnHref
} from "../lib/dictionary-return.ts";

test("builds dictionary href with encoded article return context", () => {
  assert.equal(
    buildDictionaryTermHrefWithReturn("social-group", "/theory/sociology/social-groups", 420),
    "/dictionary/social-group?from=%2Ftheory%2Fsociology%2Fsocial-groups&scroll=420"
  );
});

test("keeps only safe internal return paths", () => {
  assert.equal(getSafeDictionaryReturnHref("/theory/sociology/social-groups"), "/theory/sociology/social-groups");
  assert.equal(getSafeDictionaryReturnHref("/theory/sociology/social-groups?part=1"), "/theory/sociology/social-groups?part=1");
  assert.equal(getSafeDictionaryReturnHref("https://evil.example/theory"), null);
  assert.equal(getSafeDictionaryReturnHref("//evil.example/theory"), null);
  assert.equal(getSafeDictionaryReturnHref("javascript:alert(1)"), null);
});
