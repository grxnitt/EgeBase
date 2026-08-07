import Link from "next/link";
import type { Article } from "@/lib/content/types";

export function RelatedTopics({
  articles = [],
  currentSlug,
  sectionHref
}: {
  articles?: Article[];
  currentSlug: string;
  sectionHref: string;
}) {
  const related = articles.filter((article) => article.meta.slug !== currentSlug).slice(0, 3);

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="font-serif text-3xl">Связанные темы</h2>
      <div className="mt-5 grid grid-cols-3 gap-4">
        {related.map((article) => (
          <Link
            className="rounded-smds border border-border bg-surface p-5 transition-colors hover:border-accent"
            href={`${sectionHref}/${article.meta.slug}`}
            key={article.meta.slug}
          >
            <span className="editorial-label">{article.meta.section}</span>
            <h3 className="mt-3 font-semibold">{article.meta.title}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
