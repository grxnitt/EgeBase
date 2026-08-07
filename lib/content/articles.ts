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
        status: article.meta.status,
        href: `${section.href}/${article.meta.slug}`,
        order: article.meta.order
      }));

      const soon = (section.comingSoonTopics ?? []).map((topic) => ({
        title: topic.title,
        slug: topic.slug,
        section: section.title,
        status: "coming-soon" as const,
        order: topic.order
      }));

      return [...published, ...soon];
    })
    .sort((a, b) => a.section.localeCompare(b.section, "ru") || a.order - b.order);
}

export function searchTopics(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return getAllTopics().filter((topic) => topic.title.toLowerCase().includes(normalized));
}
