"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  forgotPasswordAction,
  loginAction,
  registerAction,
  resetPasswordAction
} from "@/lib/auth/actions";
import { initialFormState } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex h-11 items-center justify-center rounded-smds border border-primary bg-primary px-5 text-sm font-semibold text-surface transition-colors hover:border-primaryDark hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Подожди..." : children}
    </button>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  required = true
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-primaryDark">{label}</span>
      <input
        autoComplete={autoComplete}
        className="mt-2 h-11 w-full rounded-smds border border-border bg-surface px-4 text-sm text-text outline-none transition-colors placeholder:text-muted/75 focus:border-accent focus:bg-background"
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}

function FormMessage({
  status,
  message
}: {
  status: "idle" | "error" | "success";
  message: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p
      className={cn(
        "border px-4 py-3 text-sm leading-6",
        status === "success"
          ? "border-border bg-subtle text-primaryDark"
          : "border-accent/45 bg-surface text-accent"
      )}
    >
      {message}
    </p>
  );
}

export function LoginForm({ next = "/profile" }: { next?: string }) {
  const [state, action] = useActionState(loginAction, initialFormState);

  return (
    <form action={action} className="space-y-5">
      <input name="next" type="hidden" value={next} />
      <Field autoComplete="email" label="Почта" name="email" type="email" />
      <Field autoComplete="current-password" label="Пароль" name="password" type="password" />
      <FormMessage message={state.message} status={state.status} />
      <div className="flex items-center justify-between gap-4">
        <SubmitButton>Войти</SubmitButton>
        <Link className="text-sm font-semibold text-primary underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent" href="/forgot-password">
          Забыли пароль?
        </Link>
      </div>
    </form>
  );
}

export function RegisterForm({ next = "/profile" }: { next?: string }) {
  const [state, action] = useActionState(registerAction, initialFormState);

  return (
    <form action={action} className="space-y-5">
      <input name="next" type="hidden" value={next} />
      <Field autoComplete="name" label="Имя на сайте" name="display_name" required={false} />
      <Field autoComplete="email" label="Почта" name="email" type="email" />
      <Field autoComplete="new-password" label="Пароль" name="password" type="password" />
      <FormMessage message={state.message} status={state.status} />
      <SubmitButton>Создать аккаунт</SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPasswordAction, initialFormState);

  return (
    <form action={action} className="space-y-5">
      <Field autoComplete="email" label="Почта" name="email" type="email" />
      <FormMessage message={state.message} status={state.status} />
      <SubmitButton>Отправить ссылку</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(resetPasswordAction, initialFormState);

  return (
    <form action={action} className="space-y-5">
      <Field autoComplete="new-password" label="Новый пароль" name="password" type="password" />
      <Field
        autoComplete="new-password"
        label="Повтори пароль"
        name="password_repeat"
        type="password"
      />
      <FormMessage message={state.message} status={state.status} />
      <SubmitButton>Сохранить пароль</SubmitButton>
    </form>
  );
}
