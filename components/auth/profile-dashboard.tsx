"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ProfileNameForm } from "@/components/auth/profile-name-form";
import { ButtonLink } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { TopicSearchItem } from "@/lib/content/types";

type ProfileDashboardProps = {
  email?: string;
  topics: TopicSearchItem[];
  totalArticles: number;
};

type ProfileState = {
  displayName: string;
  favoriteSlugs: string[];
  readSlugs: string[];
};

const emptyProfileState: ProfileState = {
  displayName: "",
  favoriteSlugs: [],
  readSlugs: []
};

export function ProfileDashboard({ email, topics, totalArticles }: ProfileDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [profileState, setProfileState] = useState<ProfileState>(emptyProfileState);
  const topicBySlug = useMemo(() => new Map(topics.map((topic) => [topic.slug, topic])), [topics]);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    Promise.all([
      supabase.from("profiles").select("display_name").maybeSingle(),
      supabase.from("favorites").select("article_slug, created_at").order("created_at", {
        ascending: false
      }),
      supabase
        .from("article_progress")
        .select("article_slug, status, updated_at")
        .eq("status", "read")
        .order("updated_at", { ascending: false })
    ]).then(([profileResult, favoritesResult, progressResult]) => {
      if (!isMounted) {
        return;
      }

      setProfileState({
        displayName: profileResult.data?.display_name ?? "",
        favoriteSlugs: (favoritesResult.data ?? []).map((item) => item.article_slug),
        readSlugs: (progressResult.data ?? []).map((item) => item.article_slug)
      });
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const favoriteArticles = profileState.favoriteSlugs
    .map((slug) => topicBySlug.get(slug))
    .filter(Boolean);
  const readArticles = profileState.readSlugs.map((slug) => topicBySlug.get(slug)).filter(Boolean);
  const progressPercent = totalArticles ? Math.round((readArticles.length / totalArticles) * 100) : 0;

  return (
    <section className="grid grid-cols-[360px_minmax(0,1fr)] gap-10 py-10">
      <aside className="border border-border bg-surface p-6">
        <p className="editorial-label">Аккаунт</p>
        <h2 className="mt-3 text-2xl font-semibold text-primaryDark">
          {isLoading ? "Загружаем..." : profileState.displayName || "Без имени"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">{email}</p>
        <ProfileNameForm displayName={profileState.displayName} />
      </aside>

      <div className="space-y-8">
        <div className="grid grid-cols-3 gap-5">
          <StatCard label="Прочитано" value={isLoading ? "..." : String(readArticles.length)} />
          <StatCard label="Всего статей" value={String(totalArticles)} />
          <StatCard label="Прогресс" value={isLoading ? "..." : `${progressPercent}%`} />
        </div>

        <ProfileList
          emptyText="Пока нет сохранённых статей."
          isLoading={isLoading}
          items={favoriteArticles}
          title="Сохранённые статьи"
        />
        <ProfileList
          emptyText="Пока нет изученных статей."
          isLoading={isLoading}
          items={readArticles}
          title="Изученные статьи"
        />
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-surface p-5">
      <p className="editorial-label">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-primaryDark">{value}</p>
    </div>
  );
}

function ProfileList({
  title,
  emptyText,
  items,
  isLoading
}: {
  title: string;
  emptyText: string;
  items: Array<TopicSearchItem | undefined>;
  isLoading: boolean;
}) {
  const visibleItems = items.filter((item): item is TopicSearchItem => Boolean(item?.href));

  return (
    <section className="border-t border-border pt-7">
      <div className="flex items-center justify-between gap-5">
        <h2 className="font-serif text-3xl leading-tight text-primaryDark">{title}</h2>
        <ButtonLink href="/theory" variant="secondary">
          К теории
        </ButtonLink>
      </div>
      {visibleItems.length ? (
        <div className="mt-5 grid grid-cols-2 gap-4">
          {visibleItems.map((item) => (
            <Link
              className="group border border-border bg-surface p-5 transition-colors hover:border-accent"
              href={item.href ?? "/theory"}
              key={`${item.section}-${item.title}`}
            >
              <p className="editorial-label">{item.section}</p>
              <h3 className="mt-3 text-lg font-semibold leading-snug text-primaryDark group-hover:text-accent">
                {item.title}
              </h3>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-5 border border-border bg-surface px-5 py-4 text-sm leading-6 text-muted">
          {isLoading ? "Загружаем материалы..." : emptyText}
        </p>
      )}
    </section>
  );
}

