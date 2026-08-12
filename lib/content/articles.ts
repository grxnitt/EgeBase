import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { theorySections } from "@/config/theory";
import { createUniqueHeadingSlugger } from "@/lib/utils";
import { getPlanTaskOverrides } from "./plan-task-overrides";
import type {
  Article,
  ArticleMeta,
  ExamPlanPoint,
  ExamPlanTask,
  TheorySection,
  TocItem,
  TopicSearchItem
} from "./types";

const contentRoot = path.join(process.cwd(), "content");

type RankedTopicSearchItem = TopicSearchItem & { score: number };

function getSectionDir(section: TheorySection) {
  return section.contentDir ? path.join(contentRoot, section.contentDir) : null;
}

function isExamPlanPoint(point: unknown): point is ExamPlanPoint {
  if (!point || typeof point !== "object") {
    return false;
  }

  const candidate = point as ExamPlanPoint;
  return (
    typeof candidate.title === "string" &&
    (!candidate.children ||
      (Array.isArray(candidate.children) &&
        candidate.children.every((child) => typeof child === "string")))
  );
}

function parsePlanTask(planTask: unknown): ExamPlanTask | undefined {
  if (!planTask || typeof planTask !== "object") {
    return undefined;
  }

  const candidate = planTask as ExamPlanTask;
  if (
    typeof candidate.title !== "string" ||
    typeof candidate.prompt !== "string" ||
    !Array.isArray(candidate.points) ||
    !candidate.points.every(isExamPlanPoint)
  ) {
    return undefined;
  }

  return candidate;
}

function parsePlanTasks(planTasks: unknown): ExamPlanTask[] {
  if (!Array.isArray(planTasks)) {
    return [];
  }

  return planTasks.filter((plan): plan is ExamPlanTask => Boolean(parsePlanTask(plan)));
}

function readMdxFile(section: TheorySection, filename: string): Article {
  const sectionDir = getSectionDir(section);
  if (!sectionDir) {
    throw new Error(`Section "${section.slug}" does not have a contentDir.`);
  }

  const raw = fs.readFileSync(path.join(sectionDir, filename), "utf8");
  const parsed = matter(raw);
  const data = parsed.data as ArticleMeta;
  const planTasks =
    getPlanTaskOverrides(section.slug, data.slug) ??
    parsePlanTasks(data.planTasks) ??
    [];
  const fallbackPlanTask = parsePlanTask(data.planTask);
  const resolvedPlanTasks = planTasks.length ? planTasks : fallbackPlanTask ? [fallbackPlanTask] : [];

  return {
    meta: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      section: data.section,
      status: data.status,
      examYear: Number(data.examYear),
      examTasks: Array.isArray(data.examTasks) ? data.examTasks.map(Number) : [],
      order: Number(data.order),
      previous: data.previous,
      next: data.next,
      planTask: resolvedPlanTasks[0],
      planTasks: resolvedPlanTasks
    },
    body: parsed.content
  };
}

export function getPublishedArticles(sectionSlug?: string) {
  const sections = theorySections.filter(
    (section) => section.status === "available" && (!sectionSlug || section.slug === sectionSlug)
  );

  return sections
    .flatMap((section) => {
      const sectionDir = getSectionDir(section);
      if (!sectionDir || !fs.existsSync(sectionDir)) {
        return [];
      }

      return fs
        .readdirSync(sectionDir)
        .filter((file) => file.endsWith(".mdx"))
        .map((file) => readMdxFile(section, file));
    })
    .filter((article) => article.meta.status === "published")
    .sort((a, b) => a.meta.order - b.meta.order);
}

export function getSectionArticles(sectionSlug: string) {
  return getPublishedArticles(sectionSlug);
}

export function getArticleBySlug(slug: string, sectionSlug?: string) {
  return getPublishedArticles(sectionSlug).find((article) => article.meta.slug === slug);
}

export function getAdjacentArticles(article: Article) {
  const section = theorySections.find((item) => item.title === article.meta.section);
  const articles = getPublishedArticles(section?.slug);
  const previous =
    article.meta.previous && articles.find((item) => item.meta.slug === article.meta.previous);
  const next = article.meta.next && articles.find((item) => item.meta.slug === article.meta.next);

  return { previous, next };
}

export function getTableOfContents(body: string): TocItem[] {
  const headingPattern = /^(##|###)\s+(.+)$/gm;
  const headings: TocItem[] = [];
  const getUniqueSlug = createUniqueHeadingSlugger();
  let match: RegExpExecArray | null;

  while ((match = headingPattern.exec(body))) {
    const level = match[1] === "##" ? 2 : 3;
    const title = match[2].replace(/<[^>]+>/g, "").trim();
    const id = getUniqueSlug(title);

    if (level === 2) {
      headings.push({ id, title, level });
    }
  }

  return headings;
}

export function getAllTopics(): TopicSearchItem[] {
  return theorySections
    .flatMap((section) => {
      const published = getPublishedArticles(section.slug).map((article) => ({
        title: article.meta.title,
        slug: article.meta.slug,
        section: article.meta.section,
        sectionSlug: section.slug,
        status: article.meta.status,
        href: `${section.href}/${article.meta.slug}`,
        order: article.meta.order,
        excerpt: article.meta.description
      }));

      const soon = (section.comingSoonTopics ?? []).map((topic) => ({
        title: topic.title,
        slug: topic.slug,
        section: section.title,
        sectionSlug: section.slug,
        status: "coming-soon" as const,
        order: topic.order
      }));

      return [...published, ...soon];
    })
    .sort((a, b) => a.section.localeCompare(b.section, "ru") || a.order - b.order);
}

function normalizeSearchText(value: string) {
  return value.toLocaleLowerCase("ru-RU").replaceAll("ё", "е").trim();
}

function stripMdxSyntax(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_\-|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createSearchExcerpt(source: string, query: string) {
  const plainText = stripMdxSyntax(source);
  const normalizedText = normalizeSearchText(plainText);
  const normalizedQuery = normalizeSearchText(query);
  const matchIndex = normalizedText.indexOf(normalizedQuery);

  if (matchIndex === -1) {
    return undefined;
  }

  const excerptRadius = 95;
  const start = Math.max(0, matchIndex - excerptRadius);
  const end = Math.min(plainText.length, matchIndex + normalizedQuery.length + excerptRadius);
  const excerpt = plainText.slice(start, end).trim();

  return `${start > 0 ? "…" : ""}${excerpt}${end < plainText.length ? "…" : ""}`;
}

export function searchTopics(query: string, sectionSlug?: string) {
  const normalized = normalizeSearchText(query);
  if (!normalized) {
    return [];
  }

  const articles = getPublishedArticles(sectionSlug);
  const articleResults = articles
    .reduce<RankedTopicSearchItem[]>((results, article) => {
      const section = theorySections.find((item) => item.title === article.meta.section);
      const title = normalizeSearchText(article.meta.title);
      const sectionTitle = normalizeSearchText(article.meta.section);
      const description = normalizeSearchText(article.meta.description);
      const body = normalizeSearchText(stripMdxSyntax(article.body));

      let score: number | null = null;
      if (title.includes(normalized)) {
        score = 0;
      } else if (sectionTitle.includes(normalized)) {
        score = 1;
      } else if (description.includes(normalized)) {
        score = 2;
      } else if (body.includes(normalized)) {
        score = 3;
      }

      if (score === null) {
        return results;
      }

      results.push({
        title: article.meta.title,
        slug: article.meta.slug,
        section: article.meta.section,
        sectionSlug: section?.slug,
        status: article.meta.status,
        href: `${section?.href ?? "/theory"}/${article.meta.slug}`,
        order: article.meta.order,
        excerpt:
          score === 3
            ? createSearchExcerpt(article.body, query)
            : article.meta.description,
        score
      });

      return results;
    }, []);

  const soonResults = getAllTopics()
    .filter((topic) => topic.status === "coming-soon")
    .filter((topic) => !sectionSlug || topic.sectionSlug === sectionSlug)
    .filter(
      (topic) =>
        normalizeSearchText(topic.title).includes(normalized) ||
        normalizeSearchText(topic.section).includes(normalized)
    )
    .map((topic): RankedTopicSearchItem => ({ ...topic, score: 4 }));

  return [...articleResults, ...soonResults]
    .sort(
      (a, b) =>
        a.score - b.score ||
        a.section.localeCompare(b.section, "ru") ||
        a.order - b.order
    )
    .map(({ score, ...topic }) => {
      void score;
      return topic;
    });
}
