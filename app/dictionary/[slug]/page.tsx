import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import {
  getDictionarySections,
  getDictionaryTermBySlug,
  getDictionaryTermHref,
  getDictionaryTerms
} from "@/lib/dictionary";
import { siteConfig } from "@/config/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getDictionaryTerms().map((term) => ({ slug: term.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const term = getDictionaryTermBySlug(slug);

  if (!term) {
    return {};
  }

  return {
    title: term.title,
    description: term.definition,
    alternates: { canonical: getDictionaryTermHref(term.slug) },
    openGraph: {
      title: `${term.title} — словарь EgeBase`,
      description: term.definition,
      url: `${siteConfig.url}${getDictionaryTermHref(term.slug)}`,
      type: "article",
      locale: "ru_RU"
    }
  };
}

export default async function DictionaryTermPage({ params }: PageProps) {
  const { slug } = await params;
  const term = getDictionaryTermBySlug(slug);

  if (!term) {
    notFound();
  }

  const sectionTerms = getDictionarySections().find((group) => group.section === term.section)?.terms ?? [];
  const relatedTerms = sectionTerms.filter((item) => item.slug !== term.slug).slice(0, 6);
  const canonical = `${siteConfig.url}${getDictionaryTermHref(term.slug)}`;
  const definitionJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.title,
    description: term.definition,
    inDefinedTermSet: `${siteConfig.url}/dictionary`,
    url: canonical
  };

  return (
    <div className="container-shell py-8 md:py-12">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definitionJsonLd) }}
        type="application/ld+json"
      />
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Словарь", href: "/dictionary" },
          { label: term.title }
        ]}
      />
      <article className="grid gap-10 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:py-16">
        <div className="min-w-0">
          <p className="editorial-label">{term.section}</p>
          <Link
            className="mt-4 inline-flex text-sm font-semibold text-primary underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent sm:mt-8"
            href={`/dictionary?section=${encodeURIComponent(term.section)}`}
          >
            ← Все термины раздела
          </Link>
          <h1 className="mt-10 max-w-full font-serif text-[clamp(3.2rem,14vw,5.4rem)] leading-[0.95] [overflow-wrap:anywhere] sm:mt-5 sm:text-6xl sm:leading-tight sm:[overflow-wrap:normal] xl:text-7xl">
            {term.title}
          </h1>
        </div>
        <div>
          <section className="rounded-[14px] border border-border bg-surface p-6 sm:p-8">
            <p className="editorial-label">Определение</p>
            <p className="mt-5 text-xl leading-9 text-primaryDark sm:text-2xl sm:leading-10">
              {term.definition}
            </p>
          </section>
          {term.features?.length ? (
            <section className="mt-5 rounded-[14px] border border-border bg-surface p-6 sm:p-8">
              <p className="editorial-label">Признаки для задания 18</p>
              <ul className="mt-5 space-y-3 text-base leading-7 text-primaryDark sm:text-lg sm:leading-8">
                {term.features.map((feature) => (
                  <li className="flex gap-3" key={feature}>
                    <span aria-hidden="true" className="mt-3 h-2 w-2 shrink-0 rounded-full bg-accent" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {relatedTerms.length ? (
            <section className="mt-10 border-t border-border pt-7">
              <h2 className="font-serif text-3xl leading-tight">Связанные термины</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {relatedTerms.map((relatedTerm) => (
                  <Link
                    className="group rounded-[14px] border border-border bg-surface p-4 transition-colors hover:border-accent hover:bg-subtle/55"
                    href={getDictionaryTermHref(relatedTerm.slug)}
                    key={relatedTerm.slug}
                  >
                    <span className="block font-semibold text-primaryDark group-hover:text-accent">
                      {relatedTerm.title}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </article>
    </div>
  );
}
