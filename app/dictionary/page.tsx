import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { getDictionaryTerms } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "Словарь",
  description: "Короткий словарь ключевых понятий EgeBase по обществознанию.",
  alternates: { canonical: "/dictionary" }
};

export default function DictionaryPage() {
  const terms = getDictionaryTerms();
  const groupedTerms = terms.reduce<Array<{ section: string; terms: typeof terms }>>((groups, term) => {
    const existingGroup = groups.find((group) => group.section === term.section);
    if (existingGroup) {
      existingGroup.terms.push(term);
    } else {
      groups.push({ section: term.section, terms: [term] });
    }

    return groups;
  }, []);

  return (
    <div className="container-shell py-8 md:py-12">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Словарь" }]} />
      <section className="grid gap-10 py-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16 lg:py-16">
        <div>
          <p className="editorial-label">Словарь</p>
          <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-6xl">Ключевые понятия</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:mt-6 sm:text-lg sm:leading-8">
            Термины из статей теперь подсвечиваются и ведут сюда. Словарь будет постепенно
            расширяться вместе с теорией.
          </p>
        </div>
        <div className="space-y-10">
          {groupedTerms.map(({ section, terms: sectionTerms }) => (
            <section className="border-t border-border pt-6" key={section}>
              <h2 className="font-serif text-3xl leading-tight">{section}</h2>
              <div className="mt-5 grid gap-4">
                {sectionTerms.map((term) => (
                  <article
                    className="scroll-mt-28 rounded-smds border border-border bg-surface p-5 transition-colors target:border-accent target:bg-subtle/55"
                    id={term.slug}
                    key={term.slug}
                  >
                    <h3 className="text-xl font-semibold text-primaryDark">{term.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted sm:text-base sm:leading-7">
                      {term.definition}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
