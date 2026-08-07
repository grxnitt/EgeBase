import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = {
  title: "Восстановление пароля",
  description: "Восстановление доступа к профилю EgeBase."
};

export default function ForgotPasswordPage() {
  return (
    <div className="container-shell py-16">
      <section className="mx-auto max-w-xl border border-border bg-surface px-8 py-8">
        <p className="editorial-label">Профиль</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-primaryDark">
          Восстановить пароль
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">
          Введите почту, и мы отправим ссылку для смены пароля.
        </p>
        <div className="mt-7">
          <ForgotPasswordForm />
        </div>
        <p className="mt-6 text-sm text-muted">
          Вспомнили пароль?{" "}
          <Link
            className="font-semibold text-primary underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
            href="/login"
          >
            Вернуться ко входу
          </Link>
        </p>
      </section>
    </div>
  );
}

