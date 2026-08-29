import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { theorySections } from "@/config/theory";
import { getPublishedArticles } from "@/lib/content/articles";
import { getDictionaryTermHref, getDictionaryTerms } from "@/lib/dictionary";

const contentLastModified = "2026-08-05";

export default function sitemap(): MetadataRoute.Sitemap {
  const availableSectionRoutes = theorySections
    .filter((section) => section.status === "available" && section.href)
    .map((section) => section.href!);
  const staticRoutes = ["", "/theory", ...availableSectionRoutes, "/dictionary", "/cards", "/tasks", "/search"];
  const articleRoutes = getPublishedArticles().flatMap((article) => {
    const section = theorySections.find((item) => item.title === article.meta.section);
    return section?.href ? [`${section.href}/${article.meta.slug}`] : [];
  });
  const dictionaryRoutes = getDictionaryTerms().map((term) => getDictionaryTermHref(term.slug));

  return [...staticRoutes, ...articleRoutes, ...dictionaryRoutes].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: contentLastModified,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7
  }));
}
