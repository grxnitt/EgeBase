"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProfileNameFormProps = {
  initialDisplayName: string;
  onSaved?: (displayName: string) => void;
};

const requestTimeoutMs = 15000;

function withTimeout<T>(promise: PromiseLike<T>, message: string) {
  return Promise.race<T>([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), requestTimeoutMs);
    })
  ]);
}

export function ProfileNameForm({ initialDisplayName, onSaved }: ProfileNameFormProps) {
  const [value, setValue] = useState(initialDisplayName);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"muted" | "error">("muted");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextDisplayName = value.trim();

    if (nextDisplayName.length > 80) {
      setMessageTone("error");
      setMessage("Имя должно быть не длиннее 80 символов.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { data, error } = await withTimeout(
        supabase.auth.updateUser({ data: { display_name: nextDisplayName || null } }),
        "Сохранение заняло слишком много времени. Проверь соединение с Supabase."
      );

      if (error) {
        throw new Error("Не получилось сохранить имя. Попробуй выйти и войти заново.");
      }

      const savedName =
        typeof data.user?.user_metadata?.display_name === "string"
          ? data.user.user_metadata.display_name
          : nextDisplayName;

      setValue(savedName);
      onSaved?.(savedName);
      setMessageTone("muted");
      setMessage("Имя сохранено.");
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Не получилось сохранить имя.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-sm font-semibold text-primaryDark">Имя на сайте</span>
        <input
          className="mt-2 h-11 w-full rounded-smds border border-border bg-surface px-4 text-sm text-text outline-none transition-colors focus:border-accent focus:bg-background"
          maxLength={80}
          name="display_name"
          onChange={(event) => setValue(event.target.value)}
          type="text"
          value={value}
        />
      </label>
      {message ? (
        <p className={`text-sm leading-6 ${messageTone === "error" ? "text-accent" : "text-muted"}`}>
          {message}
        </p>
      ) : null}
      <button
        className="inline-flex h-11 items-center justify-center rounded-smds border border-primary bg-primary px-5 text-sm font-semibold text-surface transition-colors hover:border-primaryDark hover:bg-primaryDark disabled:opacity-60"
        disabled={isSaving}
        type="submit"
      >
        {isSaving ? "Сохраняю..." : "Сохранить"}
      </button>
    </form>
  );
}

