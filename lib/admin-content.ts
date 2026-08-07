import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type AdminTheorySection = {
  title: string;
  slug: string;
  status: string;
  order: number;
  contentDir?: string;
  href?: string;
};

export type AdminContentOptions = {
  contentRoot: string;
  sections: AdminTheorySection[];
};

export type AdminArticleSummary = {
  id: string;
  sectionSlug: string;
  sectionTitle: string;
  slug: string;
  title: string;
  description: string;
  status: string;
  order: number;
  href: string;
};

export type AdminArticleDetail = AdminArticleSummary & {
  meta: Record<string, unknown>;
  body: string;
  frontmatter: string;
};

type ResolvedArticle = {
  filePath: string;
  section: AdminTheorySection;
  sectionDir: string;
  slug: string;
};

function extractFrontmatter(raw: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    throw new Error("Article frontmatter not found.");
  }

  return match[1].trim();
}

function isSafeSlugSegment(value: string) {
  return /^[a-z0-9-]+$/.test(value);
}

function getWritableSections(options: AdminContentOptions) {
  return options.sections.filter(
    (section) => section.status === "available" && section.contentDir && section.href
  );
}

function resolveArticle(id: string, options: AdminContentOptions): ResolvedArticle {
  const parts = id.split("/");
  if (parts.length !== 2 || !parts.every(isSafeSlugSegment)) {
    throw new Error("Invalid article id.");
  }

  const [sectionSlug, slug] = parts;
  const section = getWritableSections(options).find((item) => item.slug === sectionSlug);
  if (!section || !section.contentDir) {
    throw new Error("Unknown section.");
  }

  const sectionDir = path.resolve(options.contentRoot, section.contentDir);
  const filePath = path.resolve(sectionDir, `${slug}.mdx`);
  if (!filePath.startsWith(`${sectionDir}${path.sep}`)) {
    throw new Error("Invalid article path.");
  }

  if (!fs.existsSync(filePath)) {
    throw new Error("Article file not found.");
  }

  return { filePath, section, sectionDir, slug };
}

function summaryFromFile(filePath: string, section: AdminTheorySection): AdminArticleSummary {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const slug = String(parsed.data.slug ?? path.basename(filePath, ".mdx"));
  const href = `${section.href}/${slug}`;

  return {
    id: `${section.slug}/${slug}`,
    sectionSlug: section.slug,
    sectionTitle: section.title,
    slug,
    title: String(parsed.data.title ?? slug),
    description: String(parsed.data.description ?? ""),
    status: String(parsed.data.status ?? "published"),
    order: Number(parsed.data.order ?? 0),
    href
  };
}

function detailFromFile(filePath: string, section: AdminTheorySection): AdminArticleDetail {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  return {
    ...summaryFromFile(filePath, section),
    meta: parsed.data,
    body: parsed.content.trimStart(),
    frontmatter: extractFrontmatter(raw)
  };
}

export function listAdminArticles(options: AdminContentOptions): AdminArticleSummary[] {
  return getWritableSections(options)
    .flatMap((section) => {
      const sectionDir = path.resolve(options.contentRoot, section.contentDir!);
      if (!fs.existsSync(sectionDir)) {
        return [];
      }

      return fs
        .readdirSync(sectionDir)
        .filter((file) => file.endsWith(".mdx"))
        .map((file) => summaryFromFile(path.join(sectionDir, file), section));
    })
    .sort(
      (a, b) =>
        a.sectionTitle.localeCompare(b.sectionTitle, "ru") ||
        a.order - b.order ||
        a.title.localeCompare(b.title, "ru")
    );
}

export function readAdminArticle(
  id: string,
  options: AdminContentOptions
): AdminArticleDetail {
  const resolved = resolveArticle(id, options);
  return detailFromFile(resolved.filePath, resolved.section);
}

export function writeAdminArticleBody(
  id: string,
  body: string,
  options: AdminContentOptions
): AdminArticleDetail {
  const resolved = resolveArticle(id, options);
  const currentRaw = fs.readFileSync(resolved.filePath, "utf8");
  const frontmatter = extractFrontmatter(currentRaw);
  const nextBody = body.trimEnd();
  const nextRaw = `---\n${frontmatter}\n---\n\n${nextBody}\n`;

  fs.writeFileSync(resolved.filePath, nextRaw, "utf8");
  return detailFromFile(resolved.filePath, resolved.section);
}
