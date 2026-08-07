import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = {
  title: "Новый пароль",
  description: "Смена пароля профиля EgeBase."
};

export default function ResetPasswordPage() {
  return (
    <div className="container-shell py-16">
      <section className="mx-auto max-w-xl rounded-smds border border-border bg-surface px-8 py-8">
        <p className="editorial-label">Профиль</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-primaryDark">Новый пароль</h1>
        <p className="mt-4 text-base leading-7 text-muted">
          Придумайте новый пароль. После сохранения вы попадёте в профиль.
        </p>
        <div className="mt-7">
          <ResetPasswordForm />
        </div>
      </section>
    </div>
  );
}
