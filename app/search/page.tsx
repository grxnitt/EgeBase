import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { SearchInput } from "@/components/search/search-input";
import { Badge } from "@/components/ui/badge";
import { searchTopics } from "@/lib/content/articles";

export const metadata: Metadata = {
  title: "Поиск тем",
  description: "Поиск EgeBase по названиям тем.",
  alternates: { canonical: "/search" }
};

export default async function SearchPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q ?? "";
  const results = searchTopics(query);

  return (
    <div className="container-shell py-8 md:py-12">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Поиск" }]} />
      <section className="grid gap-10 py-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16 lg:py-16">
        <div>
          <p className="editorial-label">Поиск</p>
          <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-6xl">Найти тему</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:mt-6 sm:text-lg sm:leading-8">
            Найдите тему по названию или фрагменту слова.
          </p>
        </div>
        <div>
          <SearchInput
            defaultValue={query}
            label="Введите название темы"
            placeholder="Например, стратиф"
          />
          <div className="mt-8 border-t border-border">
            {query.trim() ? (
              results.length ? (
                results.map((topic) =>
                  topic.status === "published" ? (
                    <Link
                      className="group flex flex-col gap-3 border-b border-border py-5 transition-colors hover:border-accent hover:text-accent sm:flex-row sm:items-center sm:justify-between"
                      href={topic.href ?? "/theory/sociology"}
                      key={topic.slug}
                    >
                      <span>
                        <span className="block text-xl font-semibold">{topic.title}</span>
                        <span className="mt-1 block text-sm text-muted">{topic.section}</span>
                      </span>
                      <span className="text-sm font-semibold text-accent">
                        Читать <span aria-hidden="true" className="motion-arrow">→</span>
                      </span>
                    </Link>
                  ) : (
                    <div
                      className="flex flex-col gap-3 border-b border-border py-5 opacity-70 sm:flex-row sm:items-center sm:justify-between"
                      key={topic.slug}
                    >
                      <span>
                        <span className="block text-xl font-semibold">{topic.title}</span>
                        <span className="mt-1 block text-sm text-muted">{topic.section}</span>
                      </span>
                      <Badge>Скоро</Badge>
                    </div>
                  )
                )
              ) : (
                <div className="py-12">
                  <h2 className="font-serif text-3xl">Ничего не найдено</h2>
                  <p className="mt-3 text-muted">Попробуйте искать по названию темы, например «стратиф».</p>
                </div>
              )
            ) : (
              <div className="py-12">
                <h2 className="font-serif text-3xl">Введите название темы</h2>
                <p className="mt-3 text-muted">Можно ввести часть слова: поиск не зависит от регистра.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
