import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ArticleList } from "@/components/theory/article-list";
import { Badge } from "@/components/ui/badge";
import { getAllTopics, getSectionArticles } from "@/lib/content/articles";
import { humanAndSocietySection } from "@/config/theory";

export const metadata: Metadata = {
  title: "Человек и общество — теория ЕГЭ",
  description:
    "Опубликованные материалы раздела «Человек и общество»: человек, мировоззрение, деятельность, познание, общество, культура, наука, образование, религия и искусство.",
  alternates: { canonical: "/theory/human-and-society" }
};

export default function HumanAndSocietyPage() {
  const articles = getSectionArticles("human-and-society");
  const topics = getAllTopics().filter((topic) => topic.section === humanAndSocietySection.title);

  return (
    <div className="container-shell py-8 md:py-12">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Теория", href: "/theory" },
          { label: "Человек и общество" }
        ]}
      />
      <section className="grid gap-10 py-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-16">
        <div>
          <p className="editorial-label">Раздел</p>
          <h1 className="mt-5 font-serif text-4xl sm:text-5xl lg:text-6xl">{humanAndSocietySection.title}</h1>
          <p className="mt-6 text-lg leading-8 text-muted">{humanAndSocietySection.description}</p>
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
