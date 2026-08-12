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
      <h2 className="font-serif text-3xl sm:text-4xl">Связанные темы</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((article) => (
          <Link
            className="rounded-[14px] border border-border bg-surface p-5 transition-colors hover:border-accent"
            href={`${sectionHref}/${article.meta.slug}`}
            key={article.meta.slug}
          >
            <span className="editorial-label">{article.meta.section}</span>
            <h3 className="mt-3 text-xl font-semibold leading-snug sm:text-lg">
              {article.meta.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
