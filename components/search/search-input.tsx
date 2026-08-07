import { Search } from "lucide-react";

export function SearchInput({
  defaultValue = "",
  compact = false,
  label,
  placeholder
}: {
  defaultValue?: string;
  compact?: boolean;
  label?: string;
  placeholder?: string;
}) {
  const inputId = compact ? "header-search" : "search-page-input";
  const accessibleLabel = label ?? (compact ? "Поиск по темам" : "Введите название темы");

  return (
    <form action="/search" className="relative flex gap-2" method="get" role="search">
      <label className="sr-only" htmlFor={inputId}>
        {accessibleLabel}
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent"
      />
      <input
        className="h-10 w-full rounded-smds border border-border bg-surface pl-9 pr-3 text-sm text-text transition-colors placeholder:text-muted hover:border-accent focus:border-accent focus:bg-background"
        id={inputId}
        name="q"
        placeholder={placeholder ?? "Найти тему"}
        type="search"
        defaultValue={defaultValue}
      />
      <button
        aria-label={compact ? "Запустить поиск по темам" : undefined}
        className={
          compact
            ? "sr-only"
            : "inline-flex h-10 shrink-0 items-center justify-center rounded-smds border border-primary bg-primary px-4 text-sm font-semibold text-surface transition-colors hover:bg-primaryDark"
        }
        type="submit"
      >
        {compact ? "Запустить поиск" : "Искать"}
      </button>
    </form>
  );
}
