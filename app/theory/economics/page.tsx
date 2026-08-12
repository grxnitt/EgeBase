import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ArticleList } from "@/components/theory/article-list";
import { Badge } from "@/components/ui/badge";
import { economicsSection } from "@/config/theory";
import { getAllTopics, getSectionArticles } from "@/lib/content/articles";

export const metadata: Metadata = {
  title: "Экономика — теория ЕГЭ",
  description:
    "Материалы раздела «Экономика»: рынки, фирмы, конкуренция, финансы, инфляция, налоги, бюджет, рост и мировая экономика.",
  alternates: { canonical: "/theory/economics" }
};

export default function EconomicsPage() {
  const articles = getSectionArticles("economics");
  const topics = getAllTopics().filter((topic) => topic.section === economicsSection.title);

  return (
    <div className="container-shell py-8 md:py-12">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Теория", href: "/theory" },
          { label: "Экономика" }
        ]}
      />
      <section className="grid gap-10 py-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-16">
        <div>
          <p className="editorial-label">Раздел</p>
          <h1 className="mt-5 font-serif text-4xl sm:text-5xl lg:text-6xl">{economicsSection.title}</h1>
          <p className="mt-6 text-lg leading-8 text-muted">{economicsSection.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Badge>{articles.length} опубликованных материалов</Badge>
            <Badge>{topics.length - articles.length} тем скоро</Badge>
          </div>
        </div>
        <ArticleList topics={topics} />
      </section>
    </div>
  );
}
