import { theorySections } from "@/config/theory";
import { getDictionaryTermHref, getDictionaryTerms } from "@/lib/dictionary";
import { getPublishedArticles } from "@/lib/content/articles";
import type { TopicStatus } from "@/lib/content/types";

export type SiteSearchResultKind = "section" | "article" | "term";

export type SiteSearchResult = {
  kind: SiteSearchResultKind;
  title: string;
  slug: string;
  section: string;
  sectionSlug?: string;
  status: TopicStatus | "available";
  href: string;
  order: number;
  excerpt?: string;
};

type RankedSiteSearchResult = SiteSearchResult & { score: number };

const COMMON_RUSSIAN_ENDINGS = [
  "иями",
  "ями",
  "ами",
  "ого",
  "ему",
  "ыми",
  "ими",
  "ией",
  "ия",
  "ии",
  "ию",
  "ие",
  "ая",
  "яя",
  "ое",
  "ее",
  "ый",
  "ий",
  "ой",
  "ым",
  "им",
  "ых",
  "их",
  "ом",
  "ем",
  "ам",
  "ям",
  "ах",
  "ях",
  "ов",
  "ев",
  "ей",
  "а",
  "я",
  "ы",
  "и",
  "у",
  "ю",
  "е",
  "о"
];

export function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase("ru-RU")
    .replaceAll("ё", "е")
    .replace(/[^0-9a-zа-я]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function stripMdxSyntax(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_\-|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeToken(token: string) {
  const normalized = normalizeSearchText(token);
  if (normalized.length < 5) {
    return normalized;
  }

  const ending = COMMON_RUSSIAN_ENDINGS.find(
    (candidate) => normalized.length - candidate.length >= 4 && normalized.endsWith(candidate)
  );

  return ending ? normalized.slice(0, -ending.length) : normalized;
}

function getSearchNeedles(query: string) {
  const normalized = normalizeSearchText(query);
  if (normalized.length < 3) {
    return [];
  }

  const tokens = normalized.split(" ").filter(Boolean);
  const stems = tokens.map(normalizeToken).filter((token) => token.length >= 3);
  return [...new Set([normalized, ...stems].filter((needle) => needle.length >= 3))];
}

function matchesValue(value: string, needles: string[]) {
  const normalized = normalizeSearchText(value);
  if (!normalized) {
    return false;
  }

  return needles.every((needle) => normalized.includes(needle));
}

function findFirstNeedle(value: string, needles: string[]) {
  const normalized = normalizeSearchText(value);
  return needles
    .filter((needle) => normalized.includes(needle))
    .sort((a, b) => b.length - a.length)[0];
}

function createSearchExcerpt(source: string, query: string) {
  const plainText = stripMdxSyntax(source);
  const needles = getSearchNeedles(query);
  const needle = findFirstNeedle(plainText, needles);

  if (!needle) {
    return undefined;
  }

  const normalizedText = normalizeSearchText(plainText);
  const matchIndex = normalizedText.indexOf(needle);
  if (matchIndex === -1) {
    return undefined;
  }

  const excerptRadius = 95;
  const start = Math.max(0, matchIndex - excerptRadius);
  const end = Math.min(plainText.length, matchIndex + needle.length + excerptRadius);
  const excerpt = plainText.slice(start, end).trim();

  return `${start > 0 ? "…" : ""}${excerpt}${end < plainText.length ? "…" : ""}`;
}

export function searchSite(query: string, sectionSlug?: string): SiteSearchResult[] {
  const needles = getSearchNeedles(query);
  if (!needles.length) {
    return [];
  }

  const sectionResults = theorySections
    .filter((section) => section.status === "available")
    .filter((section) => !sectionSlug || section.slug === sectionSlug)
    .filter((section) => matchesValue(`${section.title} ${section.description}`, needles))
    .map(
      (section): RankedSiteSearchResult => ({
        kind: "section",
        title: section.title,
        slug: section.slug,
        section: "Раздел теории",
        sectionSlug: section.slug,
        status: "available",
        href: section.href ?? "/theory",
        order: section.order,
        excerpt: section.description,
        score: matchesValue(section.title, needles) ? 0 : 2
      })
    );

  const articleResults = getPublishedArticles(sectionSlug).reduce<RankedSiteSearchResult[]>(
    (results, article) => {
      const section = theorySections.find((item) => item.title === article.meta.section);
      const haystacks = [
        article.meta.title,
        article.meta.description,
        stripMdxSyntax(article.body)
      ];
      const matchedIndex = haystacks.findIndex((value) => matchesValue(value, needles));

      if (matchedIndex === -1) {
        return results;
      }

      results.push({
        kind: "article",
        title: article.meta.title,
        slug: article.meta.slug,
        section: article.meta.section,
        sectionSlug: section?.slug,
        status: article.meta.status,
        href: `${section?.href ?? "/theory"}/${article.meta.slug}`,
        order: article.meta.order,
        excerpt: matchedIndex === 2 ? createSearchExcerpt(article.body, query) : article.meta.description,
        score: matchedIndex + 1
      });

      return results;
    },
    []
  );

  const termResults = getDictionaryTerms()
    .filter((term) => !sectionSlug || theorySections.find((section) => section.slug === sectionSlug)?.title === term.section)
    .filter((term) =>
      matchesValue(
        [term.title, term.definition, ...(term.aliases ?? []), ...(term.features ?? [])].join(" "),
        needles
      )
    )
    .map((term): RankedSiteSearchResult => {
      const titleMatches = matchesValue(term.title, needles) || (term.aliases ?? []).some((alias) => matchesValue(alias, needles));

      return {
        kind: "term",
        title: term.title,
        slug: term.slug,
        section: term.section,
        status: "published",
        href: getDictionaryTermHref(term.slug),
        order: 0,
        excerpt: term.definition,
        score: titleMatches ? 0.5 : 3.5
      };
    });

  return [...sectionResults, ...termResults, ...articleResults]
    .sort(
      (a, b) =>
        a.score - b.score ||
        a.section.localeCompare(b.section, "ru") ||
        a.title.localeCompare(b.title, "ru") ||
        a.order - b.order
    )
    .map(({ score, ...result }) => {
      void score;
      return result;
    });
}
