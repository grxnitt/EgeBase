"use server";

import { revalidatePath } from "next/cache";
import { getAllTopics } from "@/lib/content/articles";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type ArticleUserState =
  | {
      isAuthenticated: false;
      isFavorite: false;
      isRead: false;
      message?: string;
    }
  | {
      isAuthenticated: true;
      isFavorite: boolean;
      isRead: boolean;
      message?: string;
    };

export type ProfileFormState = {
  status: "idle" | "error" | "success";
  message: string;
};

export const initialProfileFormState: ProfileFormState = {
  status: "idle",
  message: ""
};

function getPublishedTopic(articleSlug: string) {
  return getAllTopics().find((topic) => topic.status === "published" && topic.slug === articleSlug);
}

async function getUserAndClient() {
  if (!isSupabaseConfigured()) {
    return { supabase: null, userId: null };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { supabase, userId: user?.id ?? null };
}

export async function getArticleStateAction(articleSlug: string): Promise<ArticleUserState> {
  const topic = getPublishedTopic(articleSlug);
  const { supabase, userId } = await getUserAndClient();

  if (!topic || !supabase || !userId) {
    return { isAuthenticated: false, isFavorite: false, isRead: false };
  }

  const [{ data: favorite }, { data: progress }] = await Promise.all([
    supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("article_slug", articleSlug)
      .maybeSingle(),
    supabase
      .from("article_progress")
      .select("status")
      .eq("user_id", userId)
      .eq("article_slug", articleSlug)
      .maybeSingle()
  ]);

  return {
    isAuthenticated: true,
    isFavorite: Boolean(favorite),
    isRead: progress?.status === "read"
  };
}

export async function setFavoriteAction(
  articleSlug: string,
  shouldSave: boolean
): Promise<ArticleUserState> {
  const topic = getPublishedTopic(articleSlug);
  const { supabase, userId } = await getUserAndClient();

  if (!topic) {
    return {
      isAuthenticated: false,
      isFavorite: false,
      isRead: false,
      message: "Материал не найден."
    };
  }

  if (!supabase || !userId) {
    return {
      isAuthenticated: false,
      isFavorite: false,
      isRead: false,
      message: "Войди, чтобы сохранять статьи."
    };
  }

  if (shouldSave) {
    await supabase
      .from("favorites")
      .upsert({ user_id: userId, article_slug: articleSlug }, { onConflict: "user_id,article_slug" });
  } else {
    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("article_slug", articleSlug);
  }

  if (topic.href) {
    revalidatePath(topic.href);
  }
  revalidatePath("/profile");

  return getArticleStateAction(articleSlug);
}

export async function setArticleReadAction(
  articleSlug: string,
  shouldMarkRead: boolean
): Promise<ArticleUserState> {
  const topic = getPublishedTopic(articleSlug);
  const { supabase, userId } = await getUserAndClient();

  if (!topic) {
    return {
      isAuthenticated: false,
      isFavorite: false,
      isRead: false,
      message: "Материал не найден."
    };
  }

  if (!supabase || !userId) {
    return {
      isAuthenticated: false,
      isFavorite: false,
      isRead: false,
      message: "Войди, чтобы отмечать прогресс."
    };
  }

  await supabase.from("article_progress").upsert(
    {
      user_id: userId,
      article_slug: articleSlug,
      status: shouldMarkRead ? "read" : "unread",
      read_at: shouldMarkRead ? new Date().toISOString() : null
    },
    { onConflict: "user_id,article_slug" }
  );

  if (topic.href) {
    revalidatePath(topic.href);
  }
  revalidatePath("/profile");

  return getArticleStateAction(articleSlug);
}

export async function updateProfileAction(
  _: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const displayNameValue = formData.get("display_name");
  const displayName = typeof displayNameValue === "string" ? displayNameValue.trim() : "";
  const { supabase, userId } = await getUserAndClient();

  if (!supabase || !userId) {
    return { status: "error", message: "Войди, чтобы изменить профиль." };
  }

  if (displayName.length > 80) {
    return { status: "error", message: "Имя должно быть не длиннее 80 символов." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName || null })
    .eq("id", userId);

  if (error) {
    return { status: "error", message: "Не получилось сохранить имя. Попробуй ещё раз." };
  }

  revalidatePath("/profile");

  return { status: "success", message: "Профиль обновлён." };
}

