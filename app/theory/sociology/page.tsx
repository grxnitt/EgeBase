import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ArticleList } from "@/components/theory/article-list";
import { Badge } from "@/components/ui/badge";
import { getAllTopics, getSectionArticles } from "@/lib/content/articles";
import { sociologySection } from "@/config/theory";

export const metadata: Metadata = {
  title: "Социология — теория ЕГЭ",
  description:
    "Опубликованные и готовящиеся материалы раздела «Социология» в EgeBase.",
  alternates: { canonical: "/theory/sociology" }
};

export default function SociologyPage() {
  const articles = getSectionArticles("sociology");
  const topics = getAllTopics().filter((topic) => topic.section === sociologySection.title);

  return (
    <div className="container-shell py-12">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Теория", href: "/theory" },
          { label: "Социология" }
        ]}
      />
      <section className="grid grid-cols-[0.8fr_1.2fr] gap-16 py-16">
        <div>
          <p className="editorial-label">Раздел</p>
          <h1 className="mt-5 font-serif text-6xl">{sociologySection.title}</h1>
          <p className="mt-6 text-lg leading-8 text-muted">{sociologySection.description}</p>
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
