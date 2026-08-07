"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { FormState } from "@/lib/auth/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function normalizeEmail(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeReturnTo(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string") {
    return "/profile";
  }

  return value.startsWith("/") && !value.startsWith("//") ? value : "/profile";
}

async function getOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return origin.replace(/\/$/, "");
}

function configurationError(): FormState {
  return {
    status: "error",
    message: "Supabase пока не настроен: проверь .env.local и ключ publishable."
  };
}

function authErrorMessage(context: "login" | "register" | "reset" | "update") {
  switch (context) {
    case "login":
      return "Не получилось войти. Проверь почту и пароль.";
    case "register":
      return "Не получилось создать аккаунт. Проверь почту и пароль.";
    case "reset":
      return "Не получилось отправить письмо. Попробуй ещё раз.";
    case "update":
      return "Не получилось обновить пароль. Открой ссылку из письма ещё раз.";
  }
}

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) {
    return configurationError();
  }

  const email = normalizeEmail(formData.get("email"));
  const password = normalizeText(formData.get("password"));
  const next = normalizeReturnTo(formData.get("next"));

  if (!email || !password) {
    return { status: "error", message: "Заполни почту и пароль." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { status: "error", message: authErrorMessage("login") };
  }

  redirect(next);
}

export async function registerAction(_: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) {
    return configurationError();
  }

  const displayName = normalizeText(formData.get("display_name"));
  const email = normalizeEmail(formData.get("email"));
  const password = normalizeText(formData.get("password"));
  const next = normalizeReturnTo(formData.get("next"));

  if (!email || !password) {
    return { status: "error", message: "Заполни почту и пароль." };
  }

  if (password.length < 8) {
    return { status: "error", message: "Пароль должен быть не короче 8 символов." };
  }

  if (displayName.length > 80) {
    return { status: "error", message: "Имя должно быть не длиннее 80 символов." };
  }

  const origin = await getOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName || null },
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}`
    }
  });

  if (error) {
    return { status: "error", message: authErrorMessage("register") };
  }

  if (data.session) {
    redirect(next);
  }

  return {
    status: "success",
    message: "Аккаунт создан. Проверь почту и подтверди регистрацию."
  };
}

export async function forgotPasswordAction(_: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) {
    return configurationError();
  }

  const email = normalizeEmail(formData.get("email"));

  if (!email) {
    return { status: "error", message: "Укажи почту, к которой привязан аккаунт." };
  }

  const origin = await getOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`
  });

  if (error) {
    return { status: "error", message: authErrorMessage("reset") };
  }

  return {
    status: "success",
    message: "Если аккаунт существует, на почту придёт ссылка для восстановления."
  };
}

export async function resetPasswordAction(_: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) {
    return configurationError();
  }

  const password = normalizeText(formData.get("password"));
  const passwordRepeat = normalizeText(formData.get("password_repeat"));

  if (!password || !passwordRepeat) {
    return { status: "error", message: "Введи новый пароль два раза." };
  }

  if (password.length < 8) {
    return { status: "error", message: "Пароль должен быть не короче 8 символов." };
  }

  if (password !== passwordRepeat) {
    return { status: "error", message: "Пароли не совпадают." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { status: "error", message: authErrorMessage("update") };
  }

  redirect("/profile");
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}
