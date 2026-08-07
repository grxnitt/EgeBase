"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

type FormStatus = "idle" | "error" | "success";

function normalizeNext(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/profile";
}

function configurationError() {
  return "Supabase пока не настроен: проверь .env.local и ключ publishable.";
}

function SubmitButton({
  children,
  pending
}: {
  children: React.ReactNode;
  pending: boolean;
}) {
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
  status: FormStatus;
  message: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p
      className={cn(
        "rounded-smds border px-4 py-3 text-sm leading-6",
        status === "success"
          ? "border-border bg-subtle text-primaryDark"
          : "border-accent/45 bg-surface text-accent"
      )}
    >
      {message}
    </p>
  );
}

function readForm(form: HTMLFormElement) {
  const formData = new FormData(form);

  return {
    displayName: String(formData.get("display_name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
    passwordRepeat: String(formData.get("password_repeat") ?? "")
  };
}

export function LoginForm({ next = "/profile" }: { next?: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const safeNext = normalizeNext(next);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!isSupabaseConfigured()) {
      setStatus("error");
      setMessage(configurationError());
      return;
    }

    const { email, password } = readForm(event.currentTarget);

    if (!email || !password) {
      setStatus("error");
      setMessage("Заполни почту и пароль.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setPending(false);
      setStatus("error");
      setMessage("Не получилось войти. Проверь почту и пароль.");
      return;
    }

    setPending(false);
    router.replace(safeNext);
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Field autoComplete="email" label="Почта" name="email" type="email" />
      <Field autoComplete="current-password" label="Пароль" name="password" type="password" />
      <FormMessage message={message} status={status} />
      <div className="flex items-center justify-between gap-4">
        <SubmitButton pending={pending}>Войти</SubmitButton>
        <Link className="text-sm font-semibold text-primary underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent" href="/forgot-password">
          Забыли пароль?
        </Link>
      </div>
    </form>
  );
}

export function RegisterForm({ next = "/profile" }: { next?: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const safeNext = normalizeNext(next);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!isSupabaseConfigured()) {
      setStatus("error");
      setMessage(configurationError());
      return;
    }

    const { displayName, email, password } = readForm(event.currentTarget);

    if (!email || !password) {
      setStatus("error");
      setMessage("Заполни почту и пароль.");
      return;
    }

    if (password.length < 8) {
      setStatus("error");
      setMessage("Пароль должен быть не короче 8 символов.");
      return;
    }

    if (displayName.length > 80) {
      setStatus("error");
      setMessage("Имя должно быть не длиннее 80 символов.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || null },
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(safeNext)}`
      }
    });

    if (error) {
      setPending(false);
      setStatus("error");
      setMessage("Не получилось создать аккаунт. Проверь почту и пароль.");
      return;
    }

    if (data.session) {
      setPending(false);
      router.replace(safeNext);
      router.refresh();
      return;
    }

    setPending(false);
    setStatus("success");
    setMessage("Аккаунт создан. Проверь почту и подтверди регистрацию.");
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Field autoComplete="name" label="Имя на сайте" name="display_name" required={false} />
      <Field autoComplete="email" label="Почта" name="email" type="email" />
      <Field autoComplete="new-password" label="Пароль" name="password" type="password" />
      <FormMessage message={message} status={status} />
      <SubmitButton pending={pending}>Создать аккаунт</SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!isSupabaseConfigured()) {
      setStatus("error");
      setMessage(configurationError());
      return;
    }

    const { email } = readForm(event.currentTarget);

    if (!email) {
      setStatus("error");
      setMessage("Укажи почту, к которой привязан аккаунт.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`
    });

    setPending(false);

    if (error) {
      setStatus("error");
      setMessage("Не получилось отправить письмо. Попробуй ещё раз.");
      return;
    }

    setStatus("success");
    setMessage("Если аккаунт существует, на почту придёт ссылка для восстановления.");
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Field autoComplete="email" label="Почта" name="email" type="email" />
      <FormMessage message={message} status={status} />
      <SubmitButton pending={pending}>Отправить ссылку</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!isSupabaseConfigured()) {
      setStatus("error");
      setMessage(configurationError());
      return;
    }

    const { password, passwordRepeat } = readForm(event.currentTarget);

    if (!password || !passwordRepeat) {
      setStatus("error");
      setMessage("Введи новый пароль два раза.");
      return;
    }

    if (password.length < 8) {
      setStatus("error");
      setMessage("Пароль должен быть не короче 8 символов.");
      return;
    }

    if (password !== passwordRepeat) {
      setStatus("error");
      setMessage("Пароли не совпадают.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setPending(false);
      setStatus("error");
      setMessage("Не получилось обновить пароль. Открой ссылку из письма ещё раз.");
      return;
    }

    setPending(false);
    router.replace("/profile");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Field autoComplete="new-password" label="Новый пароль" name="password" type="password" />
      <Field
        autoComplete="new-password"
        label="Повтори пароль"
        name="password_repeat"
        type="password"
      />
      <FormMessage message={message} status={status} />
      <SubmitButton pending={pending}>Сохранить пароль</SubmitButton>
    </form>
  );
}
