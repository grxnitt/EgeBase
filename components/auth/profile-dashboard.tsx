"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProfileNameForm } from "@/components/auth/profile-name-form";
import { ButtonLink } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { TopicSearchItem } from "@/lib/content/types";

type ProfileDashboardProps = {
  topics: TopicSearchItem[];
  totalArticles: number;
};

type ProfileState = {
  email: string;
  displayName: string;
  favoriteSlugs: string[];
  readSlugs: string[];
};

const emptyProfileState: ProfileState = {
  email: "",
  displayName: "",
  favoriteSlugs: [],
  readSlugs: []
};

const requestTimeoutMs = 15000;

function withTimeout<T>(promise: PromiseLike<T>, message: string) {
  return Promise.race<T>([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), requestTimeoutMs);
    })
  ]);
}

function getDisplayName(userMetadata: Record<string, unknown> | undefined) {
  const displayName = userMetadata?.display_name;

  return typeof displayName === "string" ? displayName : "";
}

function getLocalList(userId: string, key: "favorites" | "read") {
  try {
    const raw = window.localStorage.getItem(`egebase:${userId}:${key}`);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function mergeSlugs(primary: string[], fallback: string[]) {
  return [...new Set([...primary, ...fallback])];
}

export function ProfileDashboard({ topics, totalArticles }: ProfileDashboardProps) {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [profileState, setProfileState] = useState<ProfileState>(emptyProfileState);
  const topicBySlug = useMemo(() => new Map(topics.map((topic) => [topic.slug, topic])), [topics]);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function loadProfile() {
      try {
        const {
          data: { session }
        } = await withTimeout(supabase.auth.getSession(), "Не удалось быстро проверить вход.");

        if (!session?.user) {
          router.replace("/login?next=/profile");
          return;
        }

        if (!isMounted) {
          return;
        }

        setProfileState((current) => ({
          ...current,
          email: session.user.email ?? "",
          displayName: getDisplayName(session.user.user_metadata),
          favoriteSlugs: getLocalList(session.user.id, "favorites"),
          readSlugs: getLocalList(session.user.id, "read")
        }));
        setIsCheckingSession(false);
        setIsLoadingProgress(true);

        const [favoritesResult, progressResult] = await Promise.allSettled([
          withTimeout(
            supabase
              .from("favorites")
              .select("article_slug")
              .eq("user_id", session.user.id)
              .order("created_at", { ascending: false }),
            "Сохранённые статьи загружаются слишком долго."
          ),
          withTimeout(
            supabase
              .from("article_progress")
              .select("article_slug")
              .eq("user_id", session.user.id)
              .eq("status", "read")
              .order("updated_at", { ascending: false }),
            "Прогресс загружается слишком долго."
          )
        ]);

        if (!isMounted) {
          return;
        }

        const favoritesData =
          favoritesResult.status === "fulfilled" && !favoritesResult.value.error
            ? favoritesResult.value.data ?? []
            : [];
        const progressData =
          progressResult.status === "fulfilled" && !progressResult.value.error
            ? progressResult.value.data ?? []
            : [];
        const hasProgressError =
          favoritesResult.status === "rejected" ||
          progressResult.status === "rejected" ||
          (favoritesResult.status === "fulfilled" && Boolean(favoritesResult.value.error)) ||
          (progressResult.status === "fulfilled" && Boolean(progressResult.value.error));

        setProfileState((current) => ({
          ...current,
          favoriteSlugs: mergeSlugs(
            favoritesData.map((item) => item.article_slug),
            getLocalList(session.user.id, "favorites")
          ),
          readSlugs: mergeSlugs(
            progressData.map((item) => item.article_slug),
            getLocalList(session.user.id, "read")
          )
        }));

        setProgressMessage(
          hasProgressError
            ? "Прогресс пока не загрузился. Скорее всего, нужно применить SQL-миграции Supabase для favorites и article_progress."
            : ""
        );
      } catch {
        if (!isMounted) {
          return;
        }

        setIsCheckingSession(false);
        setProgressMessage("Не удалось проверить вход. Попробуй обновить страницу или войти заново.");
      } finally {
        if (isMounted) {
          setIsLoadingProgress(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  function handleDisplayNameSaved(displayName: string) {
    setProfileState((current) => ({ ...current, displayName }));
  }

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
          {isCheckingSession ? "Проверяем вход..." : profileState.displayName || "Без имени"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          {profileState.email || "Почта загрузится после входа"}
        </p>
        {progressMessage ? (
          <p className="mt-4 border border-accent/40 bg-background px-4 py-3 text-sm leading-6 text-accent">
            {progressMessage}
          </p>
        ) : null}
        {!isCheckingSession ? (
          <ProfileNameForm
            initialDisplayName={profileState.displayName}
            onSaved={handleDisplayNameSaved}
          />
        ) : (
          <p className="mt-5 border border-border bg-background px-4 py-3 text-sm leading-6 text-muted">
            Кабинет откроется после проверки входа.
          </p>
        )}
      </aside>

      <div className="space-y-8">
        <div className="grid grid-cols-3 gap-5">
          <StatCard label="Прочитано" value={isLoadingProgress ? "..." : String(readArticles.length)} />
          <StatCard label="Всего статей" value={String(totalArticles)} />
          <StatCard label="Прогресс" value={isLoadingProgress ? "..." : `${progressPercent}%`} />
        </div>

        <ProfileList
          emptyText="Пока нет сохранённых статей."
          isLoading={isLoadingProgress}
          items={favoriteArticles}
          title="Сохранённые статьи"
        />
        <ProfileList
          emptyText="Пока нет изученных статей."
          isLoading={isLoadingProgress}
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
