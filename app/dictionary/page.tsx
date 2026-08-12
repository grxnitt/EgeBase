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
            Короткие определения по разделам обществознания. Выберите раздел, затем откройте
            нужное понятие.
          </p>
        </div>
        <div>
          <div className="rounded-smds border border-border bg-surface p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <p className="editorial-label">Разделы словаря</p>
                <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
                  Выберите тему, чтобы открыть список терминов.
                </p>
              </div>
              {selectedSection ? (
                <span className="hidden rounded-full border border-accent/30 bg-subtle px-3 py-1 text-xs font-semibold text-accent sm:inline-flex">
                  Выбран раздел
                </span>
              ) : null}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {groupedTerms.map(({ section, terms }) => (
              <Link
                className={`group rounded-[14px] border p-5 transition-colors ${
                  selectedSection === section
                    ? "border-accent bg-primary text-surface shadow-editorial"
                    : "border-border bg-background hover:border-accent hover:bg-subtle/55"
                }`}
                href={`/dictionary?section=${encodeURIComponent(section)}`}
                key={section}
              >
                <span className="flex items-start justify-between gap-4">
                  <span
                    className={`block text-xl font-semibold leading-tight ${
                      selectedSection === section
                        ? "text-surface"
                        : "text-primaryDark group-hover:text-accent"
                    }`}
                  >
                    {section}
                  </span>
                  <span
                    className={`inline-flex min-w-9 items-center justify-center rounded-full px-2.5 py-1 text-sm font-bold ${
                      selectedSection === section
                        ? "bg-surface/15 text-surface"
                        : "bg-surface text-accent"
                    }`}
                  >
                    {terms.length}
                  </span>
                </span>
                <span
                  className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold ${
                    selectedSection === section
                      ? "text-surface/90"
                      : "text-accent"
                  }`}
                >
                  Выбрать раздел <span aria-hidden="true" className="motion-arrow">→</span>
                </span>
              </Link>
            ))}
            </div>
          </div>

          <div className="mt-8 border-t border-border">
            {visibleGroups.length ? (
              visibleGroups.map(({ section, terms }) => (
                <section className="py-7" key={section}>
                  <h2 className="font-serif text-3xl leading-tight">{section}</h2>
                  <div className="mt-5 grid gap-3">
                    {terms.map((term) => (
                      <Link
                        className="group flex flex-col gap-3 rounded-smds border border-border bg-surface p-5 transition-colors hover:border-accent hover:bg-subtle/55 sm:flex-row sm:items-center sm:justify-between"
                        href={getDictionaryTermHref(term.slug)}
                        key={term.slug}
                      >
                        <span className="block text-xl font-semibold text-primaryDark group-hover:text-accent">
                          {term.title}
                        </span>
                        <span className="text-sm font-semibold text-accent">
                          Открыть определение <span aria-hidden="true" className="motion-arrow">→</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="py-12">
                <h2 className="font-serif text-3xl">Выберите раздел выше</h2>
                <p className="mt-3 max-w-xl text-muted">
                  После выбора откроется список терминов по этой теме.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
