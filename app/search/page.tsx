import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { SearchInput } from "@/components/search/search-input";
import { Badge } from "@/components/ui/badge";
import { theorySections } from "@/config/theory";
import { searchSite, type SiteSearchResult } from "@/lib/search";
import { splitHighlightedText } from "@/lib/search-highlight";

export const metadata: Metadata = {
  title: "Поиск",
  description: "Поиск EgeBase по темам, разделам, статьям и терминам словаря.",
  alternates: { canonical: "/search" }
};

function HighlightedText({ text, query }: { text: string; query: string }) {
  return (
    <>
      {splitHighlightedText(text, query).map((part, index) =>
        part.highlighted ? (
          <mark className="search-highlight" key={`${part.text}-${index}`}>
            {part.text}
          </mark>
        ) : (
          <span key={`${part.text}-${index}`}>{part.text}</span>
        )
      )}
    </>
  );
}

function getResultKindLabel(kind: SiteSearchResult["kind"]) {
  if (kind === "term") {
    return "Термин";
  }

  if (kind === "section") {
    return "Раздел";
  }

  return "Тема";
}

function getResultAction(kind: SiteSearchResult["kind"]) {
  if (kind === "term") {
    return "Открыть определение";
  }

  if (kind === "section") {
    return "Открыть раздел";
  }

  return "Читать";
}

export default async function SearchPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string; section?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q ?? "";
  const availableSections = theorySections.filter((section) => section.status === "available");
  const selectedSection = availableSections.some((section) => section.slug === resolvedSearchParams?.section)
    ? resolvedSearchParams?.section
    : undefined;
  const results = searchSite(query, selectedSection);

  function getFilterHref(sectionSlug?: string) {
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("q", query);
    }
    if (sectionSlug) {
      params.set("section", sectionSlug);
    }

    const queryString = params.toString();
    return queryString ? `/search?${queryString}` : "/search";
  }

  return (
    <div className="container-shell py-8 md:py-12">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Поиск" }]} />
      <section className="grid gap-10 py-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16 lg:py-16">
        <div>
          <p className="editorial-label">Поиск</p>
          <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-6xl">Найти тему или термин</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:mt-6 sm:text-lg sm:leading-8">
            Ищите по названию темы, разделу, термину или фрагменту текста внутри статьи.
          </p>
        </div>
        <div>
          <SearchInput
            defaultValue={query}
            label="Введите запрос"
            placeholder="Например, стратификация или инфляция"
          />
          <div aria-label="Фильтр по разделу" className="mt-4 flex flex-wrap gap-2">
            <Link
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                !selectedSection
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-surface text-muted hover:border-accent hover:text-accent"
              }`}
              href={getFilterHref()}
            >
              Все разделы
            </Link>
            {availableSections.map((section) => (
              <Link
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  selectedSection === section.slug
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-surface text-muted hover:border-accent hover:text-accent"
                }`}
                href={getFilterHref(section.slug)}
                key={section.slug}
              >
                {section.title}
              </Link>
            ))}
          </div>
          <div className="mt-8 border-t border-border">
            {query.trim() ? (
              results.length ? (
                results.map((topic) =>
                  topic.status === "published" || topic.status === "available" ? (
                    <Link
                      className="group flex flex-col gap-3 border-b border-border py-5 transition-colors hover:border-accent hover:text-accent sm:flex-row sm:items-center sm:justify-between"
                      href={topic.href ?? "/theory/sociology"}
                      key={`${topic.kind}-${topic.slug}`}
                    >
                      <span>
                        <span className="mb-2 inline-flex rounded-smds border border-border bg-subtle px-2.5 py-1 text-xs font-semibold text-primary">
                          {getResultKindLabel(topic.kind)}
                        </span>
                        <span className="block text-xl font-semibold">
                          <HighlightedText query={query} text={topic.title} />
                        </span>
                        <span className="mt-1 block text-sm text-muted">
                          <HighlightedText query={query} text={topic.section} />
                        </span>
                        {topic.excerpt ? (
                          <span className="mt-3 block max-w-2xl text-sm leading-6 text-muted">
                            <HighlightedText query={query} text={topic.excerpt} />
                          </span>
                        ) : null}
                      </span>
                      <span className="text-sm font-semibold text-accent">
                        {getResultAction(topic.kind)} <span aria-hidden="true" className="motion-arrow">→</span>
                      </span>
                    </Link>
                  ) : (
                    <div
                      className="flex flex-col gap-3 border-b border-border py-5 opacity-70 sm:flex-row sm:items-center sm:justify-between"
                      key={`${topic.kind}-${topic.slug}`}
                    >
                      <span>
                        <span className="block text-xl font-semibold">
                          <HighlightedText query={query} text={topic.title} />
                        </span>
                        <span className="mt-1 block text-sm text-muted">
                          <HighlightedText query={query} text={topic.section} />
                        </span>
                        {topic.excerpt ? (
                          <span className="mt-3 block max-w-2xl text-sm leading-6 text-muted">
                            <HighlightedText query={query} text={topic.excerpt} />
                          </span>
                        ) : null}
                      </span>
                      <Badge>Скоро</Badge>
                    </div>
                  )
                )
              ) : (
                <div className="py-12">
                  <h2 className="font-serif text-3xl">Ничего не найдено</h2>
                  <p className="mt-3 text-muted">
                    Попробуйте другое слово или переключите фильтр на «Все разделы».
                  </p>
                </div>
              )
            ) : (
              <div className="py-12">
                <h2 className="font-serif text-3xl">Введите запрос</h2>
                <p className="mt-3 text-muted">
                  Можно искать по части слова, названию раздела, термину или фразе из статьи.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
