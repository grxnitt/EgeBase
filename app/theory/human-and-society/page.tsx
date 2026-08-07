import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ArticleCard } from "@/components/theory/article-card";
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
    <div className="container-shell py-12">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Теория", href: "/theory" },
          { label: "Человек и общество" }
        ]}
      />
      <section className="grid grid-cols-[0.8fr_1.2fr] gap-16 py-16">
        <div>
          <p className="editorial-label">Раздел</p>
          <h1 className="mt-5 font-serif text-6xl">{humanAndSocietySection.title}</h1>
          <p className="mt-6 text-lg leading-8 text-muted">{humanAndSocietySection.description}</p>
          <div className="mt-8 flex gap-3">
            <Badge>{articles.length} опубликованных материалов</Badge>
            <Badge>{topics.length - articles.length} тем скоро</Badge>
          </div>
        </div>
        <div>
          {topics.map((topic, index) => (
            <ArticleCard index={index} key={topic.slug} topic={topic} />
          ))}
        </div>
      </section>
    </div>
  );
}
