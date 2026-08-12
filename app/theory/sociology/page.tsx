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
    <div className="container-shell py-8 md:py-12">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Теория", href: "/theory" },
          { label: "Социология" }
        ]}
      />
      <section className="grid gap-10 py-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-16">
        <div>
          <p className="editorial-label">Раздел</p>
          <h1 className="mt-5 font-serif text-4xl sm:text-5xl lg:text-6xl">{sociologySection.title}</h1>
          <p className="mt-6 text-lg leading-8 text-muted">{sociologySection.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Badge>{topics.length} тем кодификатора</Badge>
          </div>
        </div>
        <ArticleList topics={topics} />
      </section>
    </div>
  );
}
