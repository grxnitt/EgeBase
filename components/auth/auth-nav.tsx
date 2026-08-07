"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { logoutAction } from "@/lib/auth/actions";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";

type AuthUser = {
  email?: string;
};

export function AuthNav() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { email: data.user.email ?? undefined } : null);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ? { email: session.user.email ?? undefined } : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (user) {
    return (
      <div className="flex items-center gap-4 text-sm font-semibold">
        <Link className="text-text transition-colors hover:text-accent" href="/profile">
          Профиль
        </Link>
        <button
          className="text-primary underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent disabled:opacity-60"
          disabled={isPending}
          onClick={() => startTransition(() => void logoutAction())}
          type="button"
        >
          Выйти
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm font-semibold">
      <Link className="text-text transition-colors hover:text-accent" href="/login">
        Войти
      </Link>
      <Link
        className="inline-flex h-10 items-center justify-center rounded-smds border border-border bg-surface px-4 text-primary transition-colors hover:border-accent hover:bg-subtle hover:text-accent"
        href="/register"
      >
        Регистрация
      </Link>
    </div>
  );
}

