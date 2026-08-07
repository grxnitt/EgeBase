import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { theorySections } from "@/config/theory";
import { getSectionArticles } from "@/lib/content/articles";

export const metadata: Metadata = {
  title: "Каталог теории",
  description: "Разделы теории EgeBase для подготовки к ЕГЭ по обществознанию.",
  alternates: { canonical: "/theory" }
};

export default function TheoryPage() {
  const availableSections = theorySections.filter((section) => section.status === "available");
  const upcomingSections = theorySections.filter((section) => section.status === "coming-soon");

  return (
    <div className="container-shell py-12">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Теория" }]} />
      <section className="grid grid-cols-[0.8fr_1.2fr] gap-16 py-16">
        <div>
          <p className="editorial-label">Каталог</p>
          <h1 className="mt-5 font-serif text-6xl leading-tight">Теория по обществознанию</h1>
          <p className="mt-6 text-lg leading-8 text-muted">
            Разделы справочника собирают ключевые темы обществознания в единую структуру:
            от базовых понятий до экзаменационных акцентов.
          </p>
        </div>
        <div>
          {availableSections.map((section) => {
            const articles = getSectionArticles(section.slug);

            return (
              <Link
                className="block border-t border-border py-8 transition-colors last:border-b hover:border-accent"
                href={section.href ?? "/theory"}
                key={section.slug}
              >
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="editorial-label">Доступный раздел</p>
                    <h2 className="mt-3 font-serif text-5xl">{section.title}</h2>
                    <p className="mt-4 max-w-2xl text-muted">{section.description}</p>
                  </div>
                  <Badge>{articles.length} материалов</Badge>
                </div>
              </Link>
            );
          })}
          <div className="mt-10 grid grid-cols-2 gap-4">
            {upcomingSections.map((section) => (
              <div className="rounded-smds border border-border bg-surface p-5 opacity-70" key={section.slug}>
                <h3 className="font-semibold">{section.title}</h3>
                <p className="mt-2 text-sm text-muted">Раздел будет добавлен позже.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
