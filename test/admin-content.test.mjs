import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  listAdminArticles,
  readAdminArticle,
  writeAdminArticleBody
} from "../lib/admin-content.ts";

function createTempContent() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "egebase-admin-"));
  const contentRoot = path.join(root, "content");
  const sectionDir = path.join(contentRoot, "demo");
  fs.mkdirSync(sectionDir, { recursive: true });
  fs.writeFileSync(
    path.join(sectionDir, "sample.mdx"),
    [
      "---",
      "title: Sample",
      "slug: sample",
      "description: Demo article",
      "section: Demo",
      "status: published",
      "examYear: 2027",
      "examTasks: [18, 24]",
      "order: 1",
      "---",
      "",
      "## Original",
      "",
      "Old body."
    ].join("\n"),
    "utf8"
  );

  return {
    contentRoot,
    sections: [
      {
        title: "Demo",
        slug: "demo",
        description: "Demo section",
        status: "available",
        order: 1,
        contentDir: "demo",
        href: "/theory/demo"
      }
    ]
  };
}

test("lists, reads, and rewrites article body while preserving frontmatter", () => {
  const options = createTempContent();

  const articles = listAdminArticles(options);
  assert.equal(articles.length, 1);
  assert.equal(articles[0].id, "demo/sample");
  assert.equal(articles[0].title, "Sample");

  const article = readAdminArticle("demo/sample", options);
  assert.equal(article.body.trim(), "## Original\n\nOld body.");
  assert.equal(article.meta.title, "Sample");
  assert.equal(article.frontmatter.includes("examTasks: [18, 24]"), true);

  const updated = writeAdminArticleBody("demo/sample", "## Updated\n\nNew body.", options);
  assert.equal(updated.body.trim(), "## Updated\n\nNew body.");

  const raw = fs.readFileSync(path.join(options.contentRoot, "demo", "sample.mdx"), "utf8");
  assert.equal(raw.includes("title: Sample"), true);
  assert.equal(raw.includes("examTasks: [18, 24]"), true);
  assert.equal(raw.includes("## Original"), false);
  assert.equal(raw.includes("## Updated"), true);
});

test("rejects article ids outside known section and slug format", () => {
  const options = createTempContent();

  assert.throws(() => readAdminArticle("../sample", options), /Invalid article id/);
  assert.throws(() => readAdminArticle("demo/../sample", options), /Invalid article id/);
  assert.throws(() => readAdminArticle("unknown/sample", options), /Unknown section/);
});
