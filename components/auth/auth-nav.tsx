"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";

type AuthUser = {
  email?: string;
};

export function AuthNav() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ? { email: data.session.user.email ?? undefined } : null);
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
