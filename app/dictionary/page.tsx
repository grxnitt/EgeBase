import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { getDictionarySections, getDictionaryTermHref } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "Словарь",
  description: "Короткий словарь ключевых понятий EgeBase по обществознанию.",
  alternates: { canonical: "/dictionary" }
};

export default async function DictionaryPage({
  searchParams
}: {
  searchParams?: Promise<{ section?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const groupedTerms = getDictionarySections();
  const selectedSection = groupedTerms.some((group) => group.section === resolvedSearchParams?.section)
    ? resolvedSearchParams?.section
    : undefined;
  const visibleGroups = selectedSection
    ? groupedTerms.filter((group) => group.section === selectedSection)
    : [];

  return (
    <div className="container-shell py-8 md:py-12">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Словарь" }]} />
      <section className="grid gap-10 py-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16 lg:py-16">
        <div>
          <p className="editorial-label">Словарь</p>
          <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-6xl">Ключевые понятия</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:mt-6 sm:text-lg sm:leading-8">
            Выберите раздел и откройте нужный термин. Из статей термины ведут сразу на
            конкретное определение.
          </p>
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            {groupedTerms.map(({ section, terms }) => (
              <Link
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  selectedSection === section
                    ? "border-accent bg-accent text-surface"
                    : "border-border bg-surface text-muted hover:border-accent hover:text-accent"
                }`}
                href={`/dictionary?section=${encodeURIComponent(section)}`}
                key={section}
              >
                {section}
                <span className="ml-2 text-xs opacity-70">{terms.length}</span>
              </Link>
            ))}
          </div>

          <div className="mt-8 border-t border-border">
            {visibleGroups.length ? (
              visibleGroups.map(({ section, terms }) => (
                <section className="py-7" key={section}>
                  <h2 className="font-serif text-3xl leading-tight">{section}</h2>
                  <div className="mt-5 grid gap-3">
                    {terms.map((term) => (
                      <Link
                        className="group rounded-smds border border-border bg-surface p-5 transition-colors hover:border-accent hover:bg-subtle/55"
                        href={getDictionaryTermHref(term.slug)}
                        key={term.slug}
                      >
                        <span className="block text-xl font-semibold text-primaryDark group-hover:text-accent">
                          {term.title}
                        </span>
                        <span className="mt-2 block text-sm leading-6 text-muted">
                          {term.definition}
                        </span>
                        <span className="mt-4 block text-sm font-semibold text-accent">
                          Открыть определение <span aria-hidden="true" className="motion-arrow">→</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="py-12">
                <h2 className="font-serif text-3xl">Выберите раздел</h2>
                <p className="mt-3 max-w-xl text-muted">
                  Так словарь не шумит всеми терминами сразу. Нажмите на раздел выше — покажем
                  только его понятия.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
