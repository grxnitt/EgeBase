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
      <article className="grid gap-10 py-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16 lg:py-16">
        <div>
          <p className="editorial-label">{term.section}</p>
          <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-6xl">{term.title}</h1>
          <Link
            className="mt-8 inline-flex text-sm font-semibold text-primary underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
            href={`/dictionary?section=${encodeURIComponent(term.section)}`}
          >
            ← Все термины раздела
          </Link>
        </div>
        <div>
          <section className="rounded-[14px] border border-border bg-surface p-6 sm:p-8">
            <p className="editorial-label">Определение</p>
            <p className="mt-5 text-xl leading-9 text-primaryDark sm:text-2xl sm:leading-10">
              {term.definition}
            </p>
          </section>
          {term.aliases?.length ? (
            <section className="mt-8 border-t border-border pt-6">
              <h2 className="font-serif text-3xl leading-tight">Встречается как</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {term.aliases.map((alias) => (
                  <span
                    className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted"
                    key={alias}
                  >
                    {alias}
                  </span>
                ))}
              </div>
            </section>
          ) : null}
          {relatedTerms.length ? (
            <section className="mt-10 border-t border-border pt-7">
              <h2 className="font-serif text-3xl leading-tight">Другие термины раздела</h2>
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
