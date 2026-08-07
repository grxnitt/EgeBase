import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = {
  title: "Регистрация",
  description: "Регистрация профиля EgeBase."
};

type RegisterPageProps = {
  searchParams: Promise<{ next?: string }>;
};

function normalizeNext(value?: string) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/profile";
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const next = normalizeNext(params.next);

  return (
    <div className="container-shell py-16">
      <section className="mx-auto max-w-xl rounded-smds border border-border bg-surface px-8 py-8">
        <p className="editorial-label">Профиль</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-primaryDark">
          Создать аккаунт
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">
          Сейчас профиль нужен только для сохранённых материалов и прогресса по статьям.
        </p>
        <div className="mt-7">
          <RegisterForm next={next} />
        </div>
        <p className="mt-6 text-sm text-muted">
          Уже есть аккаунт?{" "}
          <Link
            className="font-semibold text-primary underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
            href={`/login?next=${encodeURIComponent(next)}`}
          >
            Войти
          </Link>
        </p>
      </section>
    </div>
  );
}
