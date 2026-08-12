import type { Metadata } from "next";
import Link from "next/link";
import { HomeCatalogCta } from "@/components/home/home-catalog-cta";
import { HomePopularList } from "@/components/home/home-popular-list";
import { HomeStructureList } from "@/components/home/home-structure-list";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { theorySections } from "@/config/theory";
import { getAllTopics } from "@/lib/content/articles";

export const metadata: Metadata = {
  title: "EgeBase — вся теория ЕГЭ в одном месте",
  description:
    "Современная база теории по обществознанию для подготовки к ЕГЭ-2027: каталог тем, длинные статьи и поиск по названиям.",
  alternates: { canonical: "/" }
};

export default function HomePage() {
  const allTopics = getAllTopics();
  const sectionOrder = new Map(theorySections.map((section) => [section.title, section.order]));
  const popular = allTopics
    .filter((topic) => topic.status === "published")
    .sort(
      (a, b) =>
        (sectionOrder.get(a.section) ?? 99) - (sectionOrder.get(b.section) ?? 99) ||
        a.order - b.order
    )
    .slice(0, 3);

  return (
    <div>
      <section className="container-shell grid gap-10 border-b border-border pb-12 pt-10 md:min-h-[520px] md:pb-16 md:pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <p className="editorial-label motion-hero-label">ЕГЭ—2027 / Обществознание</p>
          <h1 className="display-title motion-hero-title mt-6">
            Вся теория ЕГЭ<span className="text-accent">.</span>
            <br />В одном месте<span className="text-accent">.</span>
          </h1>
          <p className="motion-hero-copy mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-2xl sm:leading-9">
            Актуальная теория по обществознанию — структурированно, понятно и без лишнего.
          </p>
          <div className="motion-hero-actions mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <ButtonLink className="w-full gap-2 sm:w-auto" href="/theory">
              <span>Перейти к теории</span>
              <span aria-hidden="true" className="motion-arrow">→</span>
            </ButtonLink>
            <ButtonLink className="w-full sm:w-auto" href="/search" variant="secondary">
              Найти тему
            </ButtonLink>
          </div>
        </div>
        <div className="motion-hero-catalog border-t border-border pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <p className="editorial-label">Каталог обществознания</p>
          <div className="mt-7 border-t border-accent/45">
            {theorySections.map((section) =>
              section.status === "available" && section.href ? (
                <Link
                  className="grid grid-cols-[36px_1fr] items-center gap-3 border-b border-border py-4 transition-colors hover:border-accent hover:text-accent sm:grid-cols-[44px_1fr_auto] sm:gap-4"
                  href={section.href}
                  key={section.slug}
                >
                  <span className="font-serif text-2xl text-accent">
                    {String(section.order).padStart(2, "0")}
                  </span>
                  <span className="text-lg font-semibold">{section.title}</span>
                  <Badge className="col-start-2 w-fit border-accent/45 bg-transparent text-accent sm:col-start-auto">
                    Открыть
                  </Badge>
                </Link>
              ) : (
                <div
                  className="grid grid-cols-[36px_1fr] items-center gap-3 border-b border-border py-4 opacity-70 sm:grid-cols-[44px_1fr_auto] sm:gap-4"
                  key={section.slug}
                >
                  <span className="font-serif text-2xl text-muted">
                    {String(section.order).padStart(2, "0")}
                  </span>
                  <span className="text-lg font-semibold">{section.title}</span>
                  <Badge className="col-start-2 w-fit sm:col-start-auto">Скоро</Badge>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="container-shell grid gap-10 border-b border-border py-14 md:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <div>
          <Badge className="border-accent/45 bg-transparent text-accent">
            Актуально для ЕГЭ-2027
          </Badge>
          <h2 className="mt-5 font-serif text-3xl leading-tight sm:text-4xl">
            Материалы ориентированы на актуальную структуру экзамена.
          </h2>
        </div>
        <HomeStructureList />
      </section>

      <section className="bg-surface py-14 md:py-20">
        <div className="container-shell">
          <div className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="editorial-label">Популярные материалы</p>
              <h2 className="mt-4 font-serif text-4xl sm:text-5xl">С чего начать</h2>
            </div>
            <TextLink href="/theory">Все темы</TextLink>
          </div>
          <HomePopularList topics={popular} />
        </div>
      </section>

      <section className="container-shell flex flex-col items-start gap-8 py-14 sm:flex-row sm:items-center sm:justify-between md:py-20">
        <div>
          <p className="editorial-label">Следующий шаг</p>
          <h2 className="mt-4 font-serif text-4xl sm:text-5xl">Перейдите в каталог теории.</h2>
        </div>
        <HomeCatalogCta />
      </section>
    </div>
  );
}
