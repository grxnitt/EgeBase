"use client";

import { Bookmark, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type ArticleUserActionsProps = {
  articleSlug: string;
  returnTo: string;
};

type ArticleActionState = {
  isAuthenticated: boolean;
  userId: string;
  isFavorite: boolean;
  isRead: boolean;
  message: string;
  tone: "muted" | "error";
};

const initialState: ArticleActionState = {
  isAuthenticated: false,
  userId: "",
  isFavorite: false,
  isRead: false,
  message: "",
  tone: "muted"
};

const requestTimeoutMs = 12000;

function withTimeout<T>(promise: PromiseLike<T>, message: string) {
  return Promise.race<T>([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), requestTimeoutMs);
    })
  ]);
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

function setLocalList(userId: string, key: "favorites" | "read", articleSlug: string, value: boolean) {
  const current = new Set(getLocalList(userId, key));

  if (value) {
    current.add(articleSlug);
  } else {
    current.delete(articleSlug);
  }

  window.localStorage.setItem(`egebase:${userId}:${key}`, JSON.stringify([...current]));
}

function getStorageMessage() {
  return "Сохранил локально. Чтобы прогресс был в аккаунте, примени SQL-миграции Supabase.";
}

export function ArticleUserActions({ articleSlug, returnTo }: ArticleUserActionsProps) {
  const [state, setState] = useState<ArticleActionState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadState() {
      const supabase = createClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (!session?.user) {
        setState(initialState);
        setIsLoaded(true);
        return;
      }

      const userId = session.user.id;
      const localFavorites = getLocalList(userId, "favorites");
      const localRead = getLocalList(userId, "read");
      let isFavorite = localFavorites.includes(articleSlug);
      let isRead = localRead.includes(articleSlug);
      let message = "";

      const [favoriteResult, progressResult] = await Promise.allSettled([
        withTimeout(
          supabase
            .from("favorites")
            .select("id")
            .eq("user_id", userId)
            .eq("article_slug", articleSlug)
            .maybeSingle(),
          "Избранное загружается слишком долго."
        ),
        withTimeout(
          supabase
            .from("article_progress")
            .select("status")
            .eq("user_id", userId)
            .eq("article_slug", articleSlug)
            .maybeSingle(),
          "Прогресс загружается слишком долго."
        )
      ]);

      if (favoriteResult.status === "fulfilled" && !favoriteResult.value.error) {
        isFavorite = Boolean(favoriteResult.value.data) || isFavorite;
      } else {
        message = getStorageMessage();
      }

      if (progressResult.status === "fulfilled" && !progressResult.value.error) {
        isRead = progressResult.value.data?.status === "read" || isRead;
      } else {
        message = getStorageMessage();
      }

      if (!isMounted) {
        return;
      }

      setState({
        isAuthenticated: true,
        userId,
        isFavorite,
        isRead,
        message,
        tone: message ? "error" : "muted"
      });
      setIsLoaded(true);
    }

    loadState();

    return () => {
      isMounted = false;
    };
  }, [articleSlug]);

  async function updateFavorite() {
    if (!state.isAuthenticated || !state.userId) {
      return;
    }

    const nextFavorite = !state.isFavorite;
    setIsPending(true);
    setLocalList(state.userId, "favorites", articleSlug, nextFavorite);

    try {
      const supabase = createClient();
      const request = nextFavorite
        ? supabase
            .from("favorites")
            .upsert(
              { user_id: state.userId, article_slug: articleSlug },
              { onConflict: "user_id,article_slug" }
            )
        : supabase
            .from("favorites")
            .delete()
            .eq("user_id", state.userId)
            .eq("article_slug", articleSlug);

      const { error } = await withTimeout(request, "Избранное сохраняется слишком долго.");

      if (error) {
        throw error;
      }

      setState((current) => ({
        ...current,
        isFavorite: nextFavorite,
        message: "",
        tone: "muted"
      }));
    } catch {
      setState((current) => ({
        ...current,
        isFavorite: nextFavorite,
        message: getStorageMessage(),
        tone: "error"
      }));
    } finally {
      setIsPending(false);
    }
  }

  async function updateProgress() {
    if (!state.isAuthenticated || !state.userId) {
      return;
    }

    const nextRead = !state.isRead;
    setIsPending(true);
    setLocalList(state.userId, "read", articleSlug, nextRead);

    try {
      const supabase = createClient();
      const { error } = await withTimeout(
        supabase.from("article_progress").upsert(
          {
            user_id: state.userId,
            article_slug: articleSlug,
            status: nextRead ? "read" : "unread",
            read_at: nextRead ? new Date().toISOString() : null
          },
          { onConflict: "user_id,article_slug" }
        ),
        "Прогресс сохраняется слишком долго."
      );

      if (error) {
        throw error;
      }

      setState((current) => ({
        ...current,
        isRead: nextRead,
        message: "",
        tone: "muted"
      }));
    } catch {
      setState((current) => ({
        ...current,
        isRead: nextRead,
        message: getStorageMessage(),
        tone: "error"
      }));
    } finally {
      setIsPending(false);
    }
  }

  if (!isLoaded || !state.isAuthenticated) {
    return (
      <aside className="mt-7 border border-border bg-surface px-5 py-4">
        <div className="flex items-center justify-between gap-5">
          <p className="text-sm leading-6 text-muted">
            Войдите, чтобы сохранять материал и отмечать прогресс.
          </p>
          <div className="flex shrink-0 items-center gap-3 text-sm font-semibold">
            <Link
              className="text-primary underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              href={`/login?next=${encodeURIComponent(returnTo)}`}
            >
              Войти
            </Link>
            <Link
              className="inline-flex h-9 items-center justify-center rounded-smds border border-border bg-background px-4 text-primary transition-colors hover:border-accent hover:bg-subtle hover:text-accent"
              href={`/register?next=${encodeURIComponent(returnTo)}`}
            >
              Регистрация
            </Link>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="mt-7 flex flex-wrap items-center gap-3 border border-border bg-surface px-5 py-4">
      <button
        aria-pressed={state.isFavorite}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-smds border px-4 text-sm font-semibold transition-colors disabled:opacity-60",
          state.isFavorite
            ? "border-accent bg-subtle text-accent"
            : "border-border bg-background text-primary hover:border-accent hover:text-accent"
        )}
        disabled={isPending}
        onClick={updateFavorite}
        type="button"
      >
        <Bookmark aria-hidden="true" className="h-4 w-4" />
        {state.isFavorite ? "Сохранено" : "Сохранить"}
      </button>
      <button
        aria-pressed={state.isRead}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-smds border px-4 text-sm font-semibold transition-colors disabled:opacity-60",
          state.isRead
            ? "border-accent bg-subtle text-accent"
            : "border-border bg-background text-primary hover:border-accent hover:text-accent"
        )}
        disabled={isPending}
        onClick={updateProgress}
        type="button"
      >
        <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
        {state.isRead ? "Изучено" : "Отметить изученной"}
      </button>
      {state.message ? (
        <p className={cn("text-sm leading-6", state.tone === "error" ? "text-accent" : "text-muted")}>
          {state.message}
        </p>
      ) : null}
    </aside>
  );
}

