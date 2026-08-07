import type { Metadata } from "next";
import { ProfileDashboard } from "@/components/auth/profile-dashboard";
import { getAllTopics, getPublishedArticles } from "@/lib/content/articles";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Профиль",
  description: "Профиль EgeBase: сохранённые статьи и прогресс изучения."
};

export default function ProfilePage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="container-shell py-16">
        <section className="rounded-smds border border-border bg-surface px-8 py-8">
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

  const topics = getAllTopics().filter((topic) => topic.status === "published" && topic.href);
  const totalArticles = getPublishedArticles().length;

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
      <ProfileDashboard topics={topics} totalArticles={totalArticles} />
    </div>
  );
}
