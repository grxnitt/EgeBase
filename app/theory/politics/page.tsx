import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ArticleList } from "@/components/theory/article-list";
import { Badge } from "@/components/ui/badge";
import { politicsSection } from "@/config/theory";
import { getAllTopics, getSectionArticles } from "@/lib/content/articles";

export const metadata: Metadata = {
  title: "Политика — теория ЕГЭ",
  description:
    "Материалы раздела «Политика»: власть, политическая система, государство, демократия, органы власти РФ, партии, выборы, элиты и СМИ.",
  alternates: { canonical: "/theory/politics" }
};

export default function PoliticsPage() {
  const articles = getSectionArticles("politics");
  const topics = getAllTopics().filter((topic) => topic.section === politicsSection.title);

  return (
    <div className="container-shell py-12">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Теория", href: "/theory" },
          { label: "Политика" }
        ]}
      />
      <section className="grid grid-cols-[0.8fr_1.2fr] gap-16 py-16">
        <div>
          <p className="editorial-label">Раздел</p>
          <h1 className="mt-5 font-serif text-6xl">{politicsSection.title}</h1>
          <p className="mt-6 text-lg leading-8 text-muted">{politicsSection.description}</p>
          <div className="mt-8 flex gap-3">
            <Badge>{articles.length} опубликованных материалов</Badge>
            <Badge>{topics.length - articles.length} тем скоро</Badge>
          </div>
        </div>
        <ArticleList topics={topics} />
      </section>
    </div>
  );
}
