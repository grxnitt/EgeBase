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
    <div className="container-shell py-8 md:py-12">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Теория" }]} />
      <section className="grid gap-10 py-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-16">
        <div>
          <p className="editorial-label">Каталог</p>
          <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Теория по
            <br />
            обществознанию<span className="text-accent">.</span>
          </h1>
        </div>
        <div className="lg:pt-24 xl:pt-20">
          {availableSections.map((section) => {
            const articles = getSectionArticles(section.slug);

            return (
              <Link
                className="block border-t border-border py-8 transition-colors last:border-b hover:border-accent"
                href={section.href ?? "/theory"}
                key={section.slug}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div>
                    <p className="editorial-label">Открыть раздел</p>
                    <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl">{section.title}</h2>
                    <p className="mt-4 max-w-2xl text-muted">{section.description}</p>
                  </div>
                  <Badge className="w-fit">{articles.length} тем кодификатора</Badge>
                </div>
              </Link>
            );
          })}
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {upcomingSections.map((section) => (
              <div className="rounded-[14px] border border-border bg-surface p-5 opacity-70" key={section.slug}>
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
