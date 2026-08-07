import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileNameForm } from "@/components/auth/profile-name-form";
import { ButtonLink } from "@/components/ui/button";
import { getAllTopics, getPublishedArticles } from "@/lib/content/articles";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Профиль",
  description: "Профиль EgeBase: сохранённые статьи и прогресс изучения."
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="container-shell py-16">
        <section className="border border-border bg-surface px-8 py-8">
          <p className="editorial-label">Профиль</p>
          <h1 className="mt-3 font-serif text-4xl text-primaryDark">Supabase ещё не настроен</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Добавьте `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` в
            `.env.local`, затем примените миграцию из `supabase/migrations`.
          </p>
        </section>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  const [{ data: profile }, { data: favorites }, { data: progress }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
    supabase
      .from("favorites")
      .select("article_slug, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("article_progress")
      .select("article_slug, status, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
  ]);

  const topics = getAllTopics().filter((topic) => topic.status === "published" && topic.href);
  const topicBySlug = new Map(topics.map((topic) => [topic.slug, topic]));
  const totalArticles = getPublishedArticles().length;
  const readRows = (progress ?? []).filter((item) => item.status === "read");
  const readArticles = readRows.map((item) => topicBySlug.get(item.article_slug)).filter(Boolean);
  const favoriteArticles = (favorites ?? [])
    .map((item) => topicBySlug.get(item.article_slug))
    .filter(Boolean);
  const progressPercent = totalArticles ? Math.round((readArticles.length / totalArticles) * 100) : 0;

  return (
    <div className="container-shell py-14">
      <section className="border-b border-border pb-8">
        <p className="editorial-label">Профиль</p>
        <h1 className="mt-3 font-serif text-5xl leading-tight text-primaryDark">
          Ваши материалы
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
          Здесь собраны сохранённые статьи и темы, которые вы уже отметили как изученные.
        </p>
      </section>

      <section className="grid grid-cols-[360px_minmax(0,1fr)] gap-10 py-10">
        <aside className="border border-border bg-surface p-6">
          <p className="editorial-label">Аккаунт</p>
          <h2 className="mt-3 text-2xl font-semibold text-primaryDark">
            {profile?.display_name || "Без имени"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">{user.email}</p>
          <ProfileNameForm displayName={profile?.display_name ?? ""} />
        </aside>

        <div className="space-y-8">
          <div className="grid grid-cols-3 gap-5">
            <div className="border border-border bg-surface p-5">
              <p className="editorial-label">Прочитано</p>
              <p className="mt-3 text-3xl font-semibold text-primaryDark">{readArticles.length}</p>
            </div>
            <div className="border border-border bg-surface p-5">
              <p className="editorial-label">Всего статей</p>
              <p className="mt-3 text-3xl font-semibold text-primaryDark">{totalArticles}</p>
            </div>
            <div className="border border-border bg-surface p-5">
              <p className="editorial-label">Прогресс</p>
              <p className="mt-3 text-3xl font-semibold text-primaryDark">{progressPercent}%</p>
            </div>
          </div>

          <ProfileList
            emptyText="Пока нет сохранённых статей."
            items={favoriteArticles}
            title="Сохранённые статьи"
          />
          <ProfileList
            emptyText="Пока нет изученных статей."
            items={readArticles}
            title="Изученные статьи"
          />
        </div>
      </section>
    </div>
  );
}

function ProfileList({
  title,
  emptyText,
  items
}: {
  title: string;
  emptyText: string;
  items: Array<{ title: string; section: string; href?: string } | undefined>;
}) {
  const visibleItems = items.filter((item): item is { title: string; section: string; href?: string } =>
    Boolean(item?.href)
  );

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
          {emptyText}
        </p>
      )}
    </section>
  );
}

