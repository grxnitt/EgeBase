"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { initialProfileFormState, updateProfileAction } from "@/lib/user-state/actions";

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex h-11 items-center justify-center rounded-smds border border-primary bg-primary px-5 text-sm font-semibold text-surface transition-colors hover:border-primaryDark hover:bg-primaryDark disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Сохраняю..." : "Сохранить"}
    </button>
  );
}

export function ProfileNameForm({ displayName }: { displayName: string }) {
  const [state, action] = useActionState(updateProfileAction, initialProfileFormState);

  return (
    <form action={action} className="mt-5 space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-primaryDark">Имя на сайте</span>
        <input
          className="mt-2 h-11 w-full rounded-smds border border-border bg-surface px-4 text-sm text-text outline-none transition-colors focus:border-accent focus:bg-background"
          defaultValue={displayName}
          maxLength={80}
          name="display_name"
          type="text"
        />
      </label>
      {state.message ? (
        <p className="text-sm leading-6 text-muted">{state.message}</p>
      ) : null}
      <SaveButton />
    </form>
  );
}

