import type { TheorySection } from "@/lib/content/types";

export const comingSoonSociologyTopics = [];

export const theorySections: TheorySection[] = [
  {
    title: "Человек и общество",
    slug: "human-and-society",
    description: "Базовые темы о человеке, обществе, деятельности, культуре и познании.",
    status: "available",
    order: 1,
    contentDir: "human-and-society",
    href: "/theory/human-and-society"
  },
  {
    title: "Социология",
    slug: "sociology",
    description:
      "Раздел о социальных группах, статусах, мобильности, нормах и механизмах социального контроля.",
    status: "available",
    order: 2,
    contentDir: "sociology",
    href: "/theory/sociology",
    comingSoonTopics: comingSoonSociologyTopics
  },
  {
    title: "Экономика",
    slug: "economics",
    description: "Экономические системы, рынки, деньги, фирмы, государство и финансовые институты.",
    status: "available",
    order: 3,
    contentDir: "economics",
    href: "/theory/economics"
  },
  {
    title: "Политика",
    slug: "politics",
    description: "Политическая система, власть, государство, партии, выборы и политическое участие.",
    status: "available",
    order: 4,
    contentDir: "politics",
    href: "/theory/politics"
  },
  {
    title: "Право",
    slug: "law",
    description: "Право, нормы, отрасли, правоотношения, юридическая ответственность и основы законодательства.",
    status: "available",
    order: 5,
    contentDir: "law",
    href: "/theory/law"
  }
];

export const humanAndSocietySection = theorySections.find(
  (section) => section.slug === "human-and-society"
)!;
export const sociologySection = theorySections.find((section) => section.slug === "sociology")!;
export const economicsSection = theorySections.find((section) => section.slug === "economics")!;
export const politicsSection = theorySections.find((section) => section.slug === "politics")!;
export const lawSection = theorySections.find((section) => section.slug === "law")!;
