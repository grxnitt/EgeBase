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
      <section className="container-shell grid min-h-[520px] grid-cols-[1.15fr_0.85fr] gap-16 border-b border-border pb-16 pt-16">
        <div>
          <p className="editorial-label motion-hero-label">ЕГЭ—2027 / Обществознание</p>
          <h1 className="display-title motion-hero-title mt-6">
            Вся теория ЕГЭ<span className="text-accent">.</span>
            <br />В одном месте<span className="text-accent">.</span>
          </h1>
          <p className="motion-hero-copy mt-7 max-w-2xl text-2xl leading-9 text-muted">
            Актуальная теория по обществознанию — структурированно, понятно и без лишнего.
          </p>
          <div className="motion-hero-actions mt-8 flex items-center gap-4">
            <ButtonLink className="gap-2" href="/theory">
              <span>Перейти к теории</span>
              <span aria-hidden="true" className="motion-arrow">→</span>
            </ButtonLink>
            <ButtonLink href="/search" variant="secondary">
              Найти тему
            </ButtonLink>
          </div>
        </div>
        <div className="motion-hero-catalog border-l border-border pl-10">
          <p className="editorial-label">Каталог обществознания</p>
          <div className="mt-7 border-t border-accent/45">
            {theorySections.map((section) =>
              section.status === "available" && section.href ? (
                <Link
                  className="grid grid-cols-[44px_1fr_auto] items-center gap-4 border-b border-border py-4 transition-colors hover:border-accent hover:text-accent"
                  href={section.href}
                  key={section.slug}
                >
                  <span className="font-serif text-2xl text-accent">
                    {String(section.order).padStart(2, "0")}
                  </span>
                  <span className="text-lg font-semibold">{section.title}</span>
                  <Badge className="border-accent/45 bg-transparent text-accent">Доступно</Badge>
                </Link>
              ) : (
                <div
                  className="grid grid-cols-[44px_1fr_auto] items-center gap-4 border-b border-border py-4 opacity-70"
                  key={section.slug}
                >
                  <span className="font-serif text-2xl text-muted">
                    {String(section.order).padStart(2, "0")}
                  </span>
                  <span className="text-lg font-semibold">{section.title}</span>
                  <Badge>Скоро</Badge>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="container-shell grid grid-cols-[0.9fr_1.1fr] gap-12 border-b border-border py-20">
        <div>
          <Badge className="border-accent/45 bg-transparent text-accent">
            Актуально для ЕГЭ-2027
          </Badge>
          <h2 className="mt-5 font-serif text-4xl leading-tight">
            Материалы ориентированы на актуальную структуру экзамена.
          </h2>
        </div>
        <HomeStructureList />
      </section>

      <section className="bg-surface py-20">
        <div className="container-shell">
          <div className="flex items-end justify-between border-b border-border pb-8">
            <div>
              <p className="editorial-label">Популярные материалы</p>
              <h2 className="mt-4 font-serif text-5xl">С чего начать</h2>
            </div>
            <TextLink href="/theory">Все темы</TextLink>
          </div>
          <HomePopularList topics={popular} />
        </div>
      </section>

      <section className="container-shell flex items-center justify-between py-20">
        <div>
          <p className="editorial-label">Следующий шаг</p>
          <h2 className="mt-4 font-serif text-5xl">Перейдите в каталог теории.</h2>
        </div>
        <HomeCatalogCta />
      </section>
    </div>
  );
}
