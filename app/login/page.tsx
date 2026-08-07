import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = {
  title: "Вход",
  description: "Вход в профиль EgeBase."
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string; message?: string }>;
};

function normalizeNext(value?: string) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/profile";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = normalizeNext(params.next);

  return (
    <div className="container-shell py-16">
      <section className="mx-auto max-w-xl border border-border bg-surface px-8 py-8">
        <p className="editorial-label">Профиль</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-primaryDark">Войти в EgeBase</h1>
        <p className="mt-4 text-base leading-7 text-muted">
          Сохраняйте статьи и отмечайте темы, которые уже разобрали.
        </p>
        {params.message ? (
          <p className="mt-5 border border-border bg-subtle px-4 py-3 text-sm leading-6 text-muted">
            Ссылка устарела или не подошла. Попробуйте ещё раз.
          </p>
        ) : null}
        <div className="mt-7">
          <LoginForm next={next} />
        </div>
        <p className="mt-6 text-sm text-muted">
          Нет аккаунта?{" "}
          <Link
            className="font-semibold text-primary underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
            href={`/register?next=${encodeURIComponent(next)}`}
          >
            Зарегистрироваться
          </Link>
        </p>
      </section>
    </div>
  );
}

