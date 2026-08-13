import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ArticleList } from "@/components/theory/article-list";
import { Badge } from "@/components/ui/badge";
import { lawSection } from "@/config/theory";
import { getAllTopics } from "@/lib/content/articles";

export const metadata: Metadata = {
  title: "Право — теория ЕГЭ",
  description:
    "Материалы раздела «Право»: правовые нормы, источники права, Конституция, отрасли права, ответственность, суды и правоохранительные органы.",
  alternates: { canonical: "/theory/law" }
};

export default function LawPage() {
  const topics = getAllTopics().filter((topic) => topic.section === lawSection.title);

  return (
    <div className="container-shell py-8 md:py-12">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Теория", href: "/theory" },
          { label: "Право" }
        ]}
      />
      <section className="grid gap-10 py-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-16">
        <div>
          <p className="editorial-label">Раздел</p>
          <h1 className="mt-5 font-serif text-4xl sm:text-5xl lg:text-6xl">{lawSection.title}</h1>
          <p className="mt-6 text-lg leading-8 text-muted">{lawSection.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Badge>{topics.length} тем кодификатора</Badge>
          </div>
        </div>
        <ArticleList topics={topics} />
      </section>
    </div>
  );
}
