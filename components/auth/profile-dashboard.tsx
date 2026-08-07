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
  userId: string;
  email: string;
  displayName: string;
  favoriteSlugs: string[];
  readSlugs: string[];
};

const emptyProfileState: ProfileState = {
  userId: "",
  email: "",
  displayName: "",
  favoriteSlugs: [],
  readSlugs: []
};

const requestTimeoutMs = 6000;

function withTimeout<T>(promise: PromiseLike<T>, message: string) {
  return Promise.race<T>([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), requestTimeoutMs);
    })
  ]);
}

export function ProfileDashboard({ topics, totalArticles }: ProfileDashboardProps) {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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

        const userId = session.user.id;

        if (!isMounted) {
          return;
        }

        setProfileState((current) => ({
          ...current,
          userId,
          email: session.user.email ?? ""
        }));
        setIsCheckingSession(false);
        setIsLoadingData(true);

        const [profileResult, favoritesResult, progressResult] = await Promise.allSettled([
          withTimeout(
            supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle(),
            "Профиль загружается слишком долго."
          ),
          withTimeout(
            supabase
              .from("favorites")
              .select("article_slug, created_at")
              .eq("user_id", userId)
              .order("created_at", { ascending: false }),
            "Сохранённые статьи загружаются слишком долго."
          ),
          withTimeout(
            supabase
              .from("article_progress")
              .select("article_slug, status, updated_at")
              .eq("user_id", userId)
              .eq("status", "read")
              .order("updated_at", { ascending: false }),
            "Прогресс загружается слишком долго."
          )
        ]);

        if (!isMounted) {
          return;
        }

        const profileData =
          profileResult.status === "fulfilled" && !profileResult.value.error
            ? profileResult.value.data
            : null;
        const favoritesData =
          favoritesResult.status === "fulfilled" && !favoritesResult.value.error
            ? favoritesResult.value.data ?? []
            : [];
        const progressData =
          progressResult.status === "fulfilled" && !progressResult.value.error
            ? progressResult.value.data ?? []
            : [];

        const hasDataError =
          profileResult.status === "rejected" ||
          favoritesResult.status === "rejected" ||
          progressResult.status === "rejected" ||
          (profileResult.status === "fulfilled" && Boolean(profileResult.value.error)) ||
          (favoritesResult.status === "fulfilled" && Boolean(favoritesResult.value.error)) ||
          (progressResult.status === "fulfilled" && Boolean(progressResult.value.error));

        setProfileState({
          userId,
          email: session.user.email ?? "",
          displayName: profileData?.display_name ?? "",
          favoriteSlugs: favoritesData.map((item) => item.article_slug),
          readSlugs: progressData.map((item) => item.article_slug)
        });

        if (hasDataError) {
          setErrorMessage(
            "Часть данных не загрузилась. Проверь, применены ли миграции Supabase, и обнови страницу."
          );
        }
      } catch {
        if (!isMounted) {
          return;
        }

        setIsCheckingSession(false);
        setErrorMessage("Не удалось загрузить кабинет. Попробуй обновить страницу или войти заново.");
      } finally {
        if (isMounted) {
          setIsLoadingData(false);
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
  const isLoading = isCheckingSession || isLoadingData;

  return (
    <section className="grid grid-cols-[360px_minmax(0,1fr)] gap-10 py-10">
      <aside className="border border-border bg-surface p-6">
        <p className="editorial-label">Аккаунт</p>
        <h2 className="mt-3 text-2xl font-semibold text-primaryDark">
          {isCheckingSession
            ? "Проверяем вход..."
            : profileState.displayName || "Без имени"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          {profileState.email || "Почта загрузится после входа"}
        </p>
        {errorMessage ? (
          <p className="mt-4 border border-accent/40 bg-background px-4 py-3 text-sm leading-6 text-accent">
            {errorMessage}
          </p>
        ) : null}
        {profileState.userId ? (
          <ProfileNameForm
            initialDisplayName={profileState.displayName}
            onSaved={handleDisplayNameSaved}
            userId={profileState.userId}
          />
        ) : (
          <p className="mt-5 border border-border bg-background px-4 py-3 text-sm leading-6 text-muted">
            Кабинет откроется после проверки входа.
          </p>
        )}
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

