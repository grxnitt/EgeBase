"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, RotateCcw, Save } from "lucide-react";
import type { AdminArticleDetail, AdminArticleSummary } from "@/lib/admin-content";
import { cn } from "@/lib/utils";

type AdminEditorProps = {
  initialArticles: AdminArticleSummary[];
};

type LoadState = "idle" | "loading" | "saving" | "saved" | "error";

export function AdminEditor({ initialArticles }: AdminEditorProps) {
  const [selectedId, setSelectedId] = useState(initialArticles[0]?.id ?? "");
  const [article, setArticle] = useState<AdminArticleDetail | null>(null);
  const [draft, setDraft] = useState("");
  const [state, setState] = useState<LoadState>(initialArticles.length ? "loading" : "idle");
  const [message, setMessage] = useState("");

  const groupedArticles = useMemo(() => {
    return initialArticles.reduce<Record<string, AdminArticleSummary[]>>((groups, item) => {
      groups[item.sectionTitle] ??= [];
      groups[item.sectionTitle].push(item);
      return groups;
    }, {});
  }, [initialArticles]);

  const hasChanges = article ? draft !== article.body : false;

  function selectArticle(id: string) {
    if (id === selectedId) {
      return;
    }

    setSelectedId(id);
    setState("loading");
    setMessage("");
  }

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    let isActive = true;

    fetch(`/api/admin/articles?id=${encodeURIComponent(selectedId)}`)
      .then(async (response) => {
        const payload = (await response.json()) as {
          article?: AdminArticleDetail;
          error?: string;
        };
        if (!response.ok || !payload.article) {
          throw new Error(payload.error ?? "Не удалось открыть статью.");
        }
        return payload.article;
      })
      .then((nextArticle) => {
        if (!isActive) {
          return;
        }
        setArticle(nextArticle);
        setDraft(nextArticle.body);
        setState("idle");
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }
        setState("error");
        setMessage(error instanceof Error ? error.message : "Не удалось открыть статью.");
      });

    return () => {
      isActive = false;
    };
  }, [selectedId]);

  async function saveArticle() {
    if (!article || !hasChanges) {
      return;
    }

    setState("saving");
    setMessage("");

    try {
      const response = await fetch("/api/admin/articles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: article.id, body: draft })
      });
      const payload = (await response.json()) as {
        article?: AdminArticleDetail;
        error?: string;
      };
      if (!response.ok || !payload.article) {
        throw new Error(payload.error ?? "Не удалось сохранить статью.");
      }

      setArticle(payload.article);
      setDraft(payload.article.body);
      setState("saved");
      setMessage("Сохранено в MDX-файл.");
      window.setTimeout(() => setState("idle"), 1800);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить статью.");
    }
  }

  if (!initialArticles.length) {
    return (
      <section className="border-b border-border py-12">
        <h2 className="font-serif text-3xl">Статей пока нет</h2>
        <p className="mt-3 text-muted">Админка покажет статьи, когда в `content` появятся MDX-файлы.</p>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-[320px_minmax(0,1fr)] gap-10 py-10">
      <aside className="sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto border-r border-border pr-6">
        <p className="editorial-label">Статьи</p>
        <div className="mt-5 space-y-7">
          {Object.entries(groupedArticles).map(([sectionTitle, sectionArticles]) => (
            <div key={sectionTitle}>
              <h2 className="font-serif text-2xl text-primaryDark">{sectionTitle}</h2>
              <div className="mt-3 space-y-1">
                {sectionArticles.map((item) => {
                  const isSelected = selectedId === item.id;

                  return (
                    <button
                      className={cn(
                        "block w-full rounded-smds border border-transparent px-3 py-2 text-left text-sm transition-colors hover:border-accent/35 hover:bg-subtle/55",
                        isSelected && "border-accent/45 bg-subtle text-primaryDark"
                      )}
                      key={item.id}
                      onClick={() => selectArticle(item.id)}
                      type="button"
                    >
                      <span className="block font-semibold">{item.title}</span>
                      <span className="mt-1 block text-xs text-muted">#{item.order}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="min-w-0">
        {article ? (
          <>
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="editorial-label">{article.sectionTitle}</p>
                <h2 className="mt-3 font-serif text-4xl leading-tight">{article.title}</h2>
                <p className="mt-3 max-w-3xl leading-7 text-muted">{article.description}</p>
              </div>
              <Link
                className="group inline-flex shrink-0 items-center gap-2 border-b border-border text-sm font-semibold text-primary transition-colors hover:border-accent hover:text-accent"
                href={article.href}
                target="_blank"
              >
                Открыть статью
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-[minmax(0,1fr)_300px] gap-6">
              <div>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <label className="editorial-label" htmlFor="admin-article-body">
                    Текст статьи MDX
                  </label>
                  <span
                    className={cn(
                      "text-sm",
                      state === "error" ? "text-accent" : "text-muted",
                      state === "saved" && "text-primary"
                    )}
                  >
                    {state === "loading" && "Открываю статью..."}
                    {state === "saving" && "Сохраняю..."}
                    {state === "saved" && message}
                    {state === "error" && message}
                    {state === "idle" && (hasChanges ? "Есть несохранённые изменения" : "Изменений нет")}
                  </span>
                </div>
                <textarea
                  className="min-h-[680px] w-full resize-y rounded-smds border border-border bg-surface p-5 font-mono text-sm leading-7 text-text outline-none transition-colors placeholder:text-muted hover:border-accent focus:border-accent focus:bg-background"
                  id="admin-article-body"
                  onChange={(event) => setDraft(event.target.value)}
                  spellCheck={false}
                  value={draft}
                />
                <div className="mt-4 flex items-center gap-3">
                  <button
                    className="group inline-flex h-11 items-center justify-center gap-2 rounded-smds border border-primary bg-primary px-5 text-sm font-semibold text-surface transition-colors hover:border-primaryDark hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!hasChanges || state === "saving" || state === "loading"}
                    onClick={saveArticle}
                    type="button"
                  >
                    <Save aria-hidden="true" className="h-4 w-4" />
                    Сохранить
                  </button>
                  <button
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-smds border border-border bg-surface px-5 text-sm font-semibold text-primary transition-colors hover:border-accent hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!hasChanges || state === "saving"}
                    onClick={() => setDraft(article.body)}
                    type="button"
                  >
                    <RotateCcw aria-hidden="true" className="h-4 w-4" />
                    Сбросить
                  </button>
                </div>
              </div>

              <aside className="border-l border-border pl-5">
                <p className="editorial-label">Metadata read-only</p>
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="font-semibold text-primaryDark">Slug</dt>
                    <dd className="mt-1 text-muted">{article.slug}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-primaryDark">Status</dt>
                    <dd className="mt-1 text-muted">{article.status}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-primaryDark">Порядок</dt>
                    <dd className="mt-1 text-muted">{article.order}</dd>
                  </div>
                </dl>
                <pre className="mt-6 max-h-[460px] overflow-auto rounded-smds border border-border bg-surface p-4 text-xs leading-5 text-muted">
                  {article.frontmatter}
                </pre>
              </aside>
            </div>
          </>
        ) : (
          <div className="border-y border-border py-16">
            <h2 className="font-serif text-3xl">Выберите статью</h2>
            <p className="mt-3 text-muted">Список статей находится слева.</p>
          </div>
        )}
      </div>
    </section>
  );
}
