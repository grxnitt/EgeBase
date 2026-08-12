import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { ExamTasksBlock } from "@/components/article/blocks";
import { ArticleUserActions } from "@/components/article/article-user-actions";
import { createMdxComponents } from "@/components/article/mdx-components";
import { PlanTaskDialog } from "@/components/article/plan-task-dialog";
import { RelatedTasksPanel } from "@/components/article/related-tasks-panel";
import { RelatedTopics } from "@/components/article/related-topics";
import { TableOfContents } from "@/components/article/table-of-contents";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { TextLink } from "@/components/ui/button";
import {
  getAdjacentArticles,
  getArticleBySlug,
  getPublishedArticles,
  getTableOfContents
} from "@/lib/content/articles";
import { formatExamYear } from "@/lib/utils";
import { siteConfig } from "@/config/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const sectionSlug = "politics";
const sectionHref = "/theory/politics";
const sectionTitle = "Политика";

export function generateStaticParams() {
  return getPublishedArticles(sectionSlug).map((article) => ({ slug: article.meta.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug, sectionSlug);
  if (!article) {
    return {};
  }

  const canonical = `${sectionHref}/${article.meta.slug}`;

  return {
    title: article.meta.title,
    description: article.meta.description,
    alternates: { canonical },
    openGraph: {
      title: `${article.meta.title} | EgeBase`,
      description: article.meta.description,
      url: canonical,
      type: "article",
      siteName: "EgeBase",
      locale: "ru_RU"
    }
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug, sectionSlug);
  if (!article) {
    notFound();
  }

  const toc = getTableOfContents(article.body);
  const { content } = await compileMDX({
    source: article.body,
    components: createMdxComponents(),
    options: { parseFrontmatter: false }
  });
  const allArticles = getPublishedArticles(sectionSlug);
  const adjacent = getAdjacentArticles(article);
  const canonical = `${siteConfig.url}${sectionHref}/${article.meta.slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.meta.title,
    description: article.meta.description,
    inLanguage: "ru",
    mainEntityOfPage: canonical,
    about: article.meta.section,
    educationalLevel: "ЕГЭ"
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Теория", item: `${siteConfig.url}/theory` },
      {
        "@type": "ListItem",
        position: 2,
        name: sectionTitle,
        item: `${siteConfig.url}${sectionHref}`
      },
      { "@type": "ListItem", position: 3, name: article.meta.title, item: canonical }
    ]
  };

  return (
    <div className="container-shell py-8 md:py-12">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        type="application/ld+json"
      />
      <Breadcrumbs
        items={[
          { label: "Теория", href: "/theory" },
          { label: sectionTitle, href: sectionHref },
          { label: article.meta.title }
        ]}
      />
      <article className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-12 lg:py-14">
        <div>
          <p className="editorial-label">{article.meta.section}</p>
          <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">{article.meta.title}</h1>
          <div className="mt-6 flex flex-wrap gap-3">
            <Badge>{formatExamYear(article.meta.examYear)}</Badge>
          </div>
          <section className="mt-8 border-y border-border py-6 sm:mt-10 sm:py-7">
            <h2 className="font-serif text-2xl sm:text-3xl">О чём эта тема?</h2>
            <p className="mt-4 text-base leading-7 text-muted sm:text-lg sm:leading-8">{article.meta.description}</p>
          </section>
          <div className="mt-8 rounded-smds border border-border bg-surface px-5 py-5 lg:hidden">
            <TableOfContents items={toc} />
          </div>
          <ArticleUserActions
            articleSlug={article.meta.slug}
            returnTo={`${sectionHref}/${article.meta.slug}`}
          />
          <div className="article-prose mt-10">{content}</div>
          <ExamTasksBlock tasks={article.meta.examTasks} />
          {article.meta.planTasks.length ? <PlanTaskDialog plans={article.meta.planTasks} /> : null}
          <RelatedTopics articles={allArticles} currentSlug={article.meta.slug} sectionHref={sectionHref} />
          <nav
            aria-label="Предыдущая и следующая тема"
            className="mt-12 grid gap-6 border-t border-border pt-8 sm:grid-cols-2 sm:gap-5"
          >
            <div className="article-adjacent-item group border-t border-transparent pt-4">
              <p className="editorial-label">Предыдущая</p>
              {adjacent.previous ? (
                <TextLink
                  className="mt-2 inline-flex items-center gap-2 decoration-transparent"
                  href={`${sectionHref}/${adjacent.previous.meta.slug}`}
                >
                  <span aria-hidden="true" className="motion-arrow-left -ml-1">←</span>
                  <span>{adjacent.previous.meta.title}</span>
                </TextLink>
              ) : (
                <span className="mt-2 block text-sm text-muted">Это первая тема раздела.</span>
              )}
            </div>
            <div className="article-adjacent-item group border-t border-transparent pt-4 sm:text-right">
              <p className="editorial-label">Следующая</p>
              {adjacent.next ? (
                <TextLink
                  className="mt-2 inline-flex items-center gap-2 decoration-transparent"
                  href={`${sectionHref}/${adjacent.next.meta.slug}`}
                >
                  <span>{adjacent.next.meta.title}</span>
                  <span aria-hidden="true" className="motion-arrow">→</span>
                </TextLink>
              ) : (
                <span className="mt-2 block text-sm text-muted">
                  Это последняя опубликованная тема.
                </span>
              )}
            </div>
          </nav>
        </div>
        <aside className="article-sidebar hidden border-t border-border pt-8 lg:sticky lg:top-28 lg:block lg:max-h-[calc(100vh-9rem)] lg:overflow-x-hidden lg:overflow-y-auto lg:border-l lg:border-t-0 lg:pl-5 lg:pr-2 lg:pt-0 lg:[scrollbar-gutter:stable]">
          <TableOfContents items={toc} />
          <RelatedTasksPanel tasks={article.meta.examTasks} />
        </aside>
      </article>
    </div>
  );
}
