import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { SearchInput } from "@/components/search/search-input";
import { Badge } from "@/components/ui/badge";
import { theorySections } from "@/config/theory";
import { isMeaningfulSearchQuery, searchSite, type SiteSearchResult } from "@/lib/search";
import { splitHighlightedText } from "@/lib/search-highlight";

type SearchResultFilter = "all" | SiteSearchResult["kind"];
type SearchParams = {
  q?: string | string[];
  section?: string | string[];
  type?: string | string[];
};

const resultFilters: Array<{ value: SearchResultFilter; label: string }> = [
  { value: "all", label: "Все" },
  { value: "term", label: "Термины" },
  { value: "article", label: "Темы" },
  { value: "section", label: "Разделы" }
];

const resultGroupOrder: SiteSearchResult["kind"][] = ["term", "article", "section"];

const resultGroupMeta: Record<SiteSearchResult["kind"], { title: string; description: string }> = {
  term: {
    title: "Термины",
    description: "Определения и признаки из словаря."
  },
  article: {
    title: "Темы",
    description: "Материалы теории, где встречается запрос."
  },
  section: {
    title: "Разделы",
    description: "Крупные блоки курса."
  }
};

export const metadata: Metadata = {
  title: "Поиск",
  description: "Поиск EgeBase по темам, разделам, статьям и терминам словаря.",
  alternates: { canonical: "/search" }
};

function HighlightedText({ text, query, enabled = true }: { text: string; query: string; enabled?: boolean }) {
  if (!enabled) {
    return <>{text}</>;
  }

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

function getSearchParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function isResultFilter(value?: string): value is SearchResultFilter {
  return value === "all" || value === "term" || value === "article" || value === "section";
}

function getFilterChipClass(isActive: boolean) {
  return `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-[border-color,background-color,box-shadow,color] ${
    isActive
      ? "border-accent bg-accent/16 text-primaryDark shadow-[inset_0_0_0_1px_rgba(211,78,43,0.36)]"
      : "border-border bg-surface text-muted hover:border-accent hover:text-accent"
  }`;
}

function SelectedFilterMark() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-[0.62rem] font-bold leading-none text-surface"
    >
      ✓
    </span>
  );
}

function SearchResultItem({ query, topic }: { query: string; topic: SiteSearchResult }) {
  const isOpen = topic.status === "published" || topic.status === "available";
  const shouldHighlightContent = topic.kind !== "section";
  const content = (
    <>
      <span>
        <span className="mb-2 inline-flex rounded-md border border-border bg-subtle px-2.5 py-1 text-xs font-semibold text-primary">
          {getResultKindLabel(topic.kind)}
        </span>
        <span className="block text-xl font-semibold">
          <HighlightedText enabled={shouldHighlightContent} query={query} text={topic.title} />
        </span>
        <span className="mt-1 block text-sm text-muted">
          <HighlightedText enabled={false} query={query} text={topic.section} />
        </span>
        {topic.excerpt ? (
          <span className="mt-3 block max-w-2xl text-sm leading-6 text-muted">
            <HighlightedText enabled={shouldHighlightContent} query={query} text={topic.excerpt} />
          </span>
        ) : null}
      </span>
      {isOpen ? (
        <span className="text-sm font-semibold text-accent">
          {getResultAction(topic.kind)} <span aria-hidden="true" className="motion-arrow">→</span>
        </span>
      ) : (
        <Badge>Скоро</Badge>
      )}
    </>
  );

  if (!isOpen) {
    return (
      <div className="flex flex-col gap-3 border-b border-border py-5 opacity-70 sm:flex-row sm:items-center sm:justify-between">
        {content}
      </div>
    );
  }

  return (
    <Link
      className="group flex flex-col gap-3 border-b border-border py-5 transition-colors hover:border-accent hover:text-accent sm:flex-row sm:items-center sm:justify-between"
      href={topic.href ?? "/theory"}
    >
      {content}
    </Link>
  );
}

export default async function SearchPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = getSearchParamValue(resolvedSearchParams?.q) ?? "";
  const sectionParam = getSearchParamValue(resolvedSearchParams?.section);
  const typeParam = getSearchParamValue(resolvedSearchParams?.type);
  const availableSections = theorySections.filter((section) => section.status === "available");
  const selectedSection = availableSections.some((section) => section.slug === sectionParam)
    ? sectionParam
    : undefined;
  const selectedType = isResultFilter(typeParam) ? typeParam : "all";
  const normalizedQueryLength = query.trim().replace(/\s+/g, " ").length;
  const hasQuery = normalizedQueryLength > 0;
  const isQueryTooShort = normalizedQueryLength > 0 && normalizedQueryLength < 3;
  const isQueryTooGeneral = hasQuery && !isQueryTooShort && !isMeaningfulSearchQuery(query);
  const allResults = searchSite(query, selectedSection);
  const results = selectedType === "all" ? allResults : allResults.filter((result) => result.kind === selectedType);
  const resultCounts: Record<SearchResultFilter, number> = {
    all: allResults.length,
    term: allResults.filter((result) => result.kind === "term").length,
    article: allResults.filter((result) => result.kind === "article").length,
    section: allResults.filter((result) => result.kind === "section").length
  };
  const visibleGroupKinds: SiteSearchResult["kind"][] =
    selectedType === "all" ? resultGroupOrder : [selectedType];
  const resultGroups = visibleGroupKinds
    .map((kind) => ({
      kind,
      ...resultGroupMeta[kind],
      results: results.filter((result) => result.kind === kind)
    }))
    .filter((group) => group.results.length > 0);

  function getFilterHref({
    sectionSlug,
    type = selectedType
  }: {
    sectionSlug?: string | null;
    type?: SearchResultFilter;
  } = {}) {
    const params = new URLSearchParams();
    const nextSection = sectionSlug === undefined ? selectedSection : sectionSlug ?? undefined;

    if (hasQuery) {
      params.set("q", query);
    }
    if (nextSection) {
      params.set("section", nextSection);
    }
    if (type !== "all") {
      params.set("type", type);
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
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent">Что искать</p>
            <div aria-label="Фильтр по типу результата" className="flex flex-wrap gap-2">
              {resultFilters.map((filter) => (
                <Link
                  className={getFilterChipClass(selectedType === filter.value)}
                  href={getFilterHref({ type: filter.value })}
                  key={filter.value}
                >
                  {selectedType === filter.value ? <SelectedFilterMark /> : null}
                  {filter.label}
                  {hasQuery ? <span className="ml-2 opacity-70">{resultCounts[filter.value]}</span> : null}
                </Link>
              ))}
            </div>
          </div>
          <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-accent">Где искать</p>
          <div aria-label="Фильтр по разделу" className="flex flex-wrap gap-2">
            <Link
              className={getFilterChipClass(!selectedSection)}
              href={getFilterHref({ sectionSlug: null })}
            >
              {!selectedSection ? <SelectedFilterMark /> : null}
              Все разделы
            </Link>
            {availableSections.map((section) => (
              <Link
                className={getFilterChipClass(selectedSection === section.slug)}
                href={getFilterHref({ sectionSlug: section.slug })}
                key={section.slug}
              >
                {selectedSection === section.slug ? <SelectedFilterMark /> : null}
                {section.title}
              </Link>
            ))}
          </div>
          <div className="mt-8 border-t border-border">
            {isQueryTooShort ? (
              <div className="py-12">
                <h2 className="font-serif text-3xl">Уточните запрос</h2>
                <p className="mt-3 text-muted">
                  Введите минимум 3 символа — так поиск не будет подсвечивать случайные буквы в каждом слове.
                </p>
              </div>
            ) : isQueryTooGeneral ? (
              <div className="py-12">
                <h2 className="font-serif text-3xl">Слишком общий запрос</h2>
                <p className="mt-3 text-muted">
                  Попробуйте более конкретное слово: например, «инфляция», «государство» или «банк».
                </p>
              </div>
            ) : hasQuery ? (
              results.length ? (
                resultGroups.map((group) => (
                  <section className="border-b border-border py-7 last:border-b-0" key={group.kind}>
                    <div className="mb-2 flex flex-wrap items-baseline gap-3">
                      <h2 className="font-serif text-2xl sm:text-3xl">{group.title}</h2>
                      <span className="rounded-full border border-border bg-subtle px-2.5 py-1 text-xs font-semibold text-muted">
                        {group.results.length}
                      </span>
                    </div>
                    <p className="max-w-2xl text-sm leading-6 text-muted">{group.description}</p>
                    <div className="mt-2">
                      {group.results.map((topic) => (
                        <SearchResultItem key={`${topic.kind}-${topic.slug}`} query={query} topic={topic} />
                      ))}
                    </div>
                  </section>
                ))
              ) : (
                <div className="py-12">
                  <h2 className="font-serif text-3xl">Ничего не найдено</h2>
                  <p className="mt-3 text-muted">
                    Попробуйте другое слово, переключите тип результата или выберите «Все разделы».
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
