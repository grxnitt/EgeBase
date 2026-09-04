import type { Metadata } from "next";
import { FlashcardsTrainer } from "@/components/cards/flashcards-trainer";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { getDictionarySections, getDictionaryTerms } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "Карточки",
  description: "Карточки EgeBase для быстрого повторения терминов обществознания.",
  alternates: { canonical: "/cards" }
};

export default function CardsPage() {
  const terms = getDictionaryTerms().map((term) => ({
    title: term.title,
    slug: term.slug,
    section: term.section,
    definition: term.definition,
    features: term.features
  }));
  const sections = getDictionarySections().map((group) => ({
    section: group.section,
    count: group.terms.length
  }));

  return (
    <div className="container-shell py-5 md:py-8">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Карточки" }]} />

      <section className="py-6 md:py-8 lg:py-10">
        <p className="editorial-label">Повторение</p>
        <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[0.96] sm:text-6xl lg:text-7xl">
          Карточки по словарю<span className="text-accent">.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
          Собери короткую тренировку: выбери раздел, количество понятий и проверяй себя по определениям и признакам.
        </p>
      </section>

      <FlashcardsTrainer sections={sections} terms={terms} />
    </div>
  );
}
