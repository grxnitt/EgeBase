"use client";

import { Bookmark, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import {
  getArticleStateAction,
  setArticleReadAction,
  setFavoriteAction,
  type ArticleUserState
} from "@/lib/user-state/actions";
import { cn } from "@/lib/utils";

type ArticleUserActionsProps = {
  articleSlug: string;
  returnTo: string;
};

const guestState: ArticleUserState = {
  isAuthenticated: false,
  isFavorite: false,
  isRead: false
};

export function ArticleUserActions({ articleSlug, returnTo }: ArticleUserActionsProps) {
  const [state, setState] = useState<ArticleUserState>(guestState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;

    getArticleStateAction(articleSlug).then((nextState) => {
      if (isMounted) {
        setState(nextState);
        setIsLoaded(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [articleSlug]);

  function updateFavorite() {
    if (!state.isAuthenticated) {
      return;
    }

    const nextFavorite = !state.isFavorite;
    setState({ ...state, isFavorite: nextFavorite });

    startTransition(async () => {
      setState(await setFavoriteAction(articleSlug, nextFavorite));
    });
  }

  function updateProgress() {
    if (!state.isAuthenticated) {
      return;
    }

    const nextRead = !state.isRead;
    setState({ ...state, isRead: nextRead });

    startTransition(async () => {
      setState(await setArticleReadAction(articleSlug, nextRead));
    });
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
      {state.message ? <p className="text-sm text-muted">{state.message}</p> : null}
    </aside>
  );
}

