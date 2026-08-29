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
  const accessibleLabel = label ?? (compact ? "Поиск по темам и терминам" : "Введите тему или термин");

  return (
    <form action="/search" className="flex flex-col gap-3 sm:flex-row sm:gap-2" method="get" role="search">
      <label className="sr-only" htmlFor={inputId}>
        {accessibleLabel}
      </label>
      <div className="relative min-w-0 flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-accent sm:left-3 sm:h-4 sm:w-4"
        />
        <input
          className="h-12 w-full rounded-smds border border-border bg-surface pl-12 pr-4 text-base text-text transition-colors placeholder:text-muted hover:border-accent focus:border-accent focus:bg-background sm:h-10 sm:pl-9 sm:pr-3 sm:text-sm"
          id={inputId}
          name="q"
          placeholder={placeholder ?? "Найти тему или термин"}
          type="search"
          defaultValue={defaultValue}
        />
      </div>
      <button
        aria-label={compact ? "Запустить поиск по темам и терминам" : undefined}
        className={
          compact
            ? "sr-only"
            : "inline-flex h-12 shrink-0 items-center justify-center rounded-smds border border-primary bg-primary px-5 text-base font-semibold text-surface transition-colors hover:bg-primaryDark sm:h-10 sm:px-4 sm:text-sm"
        }
        type="submit"
      >
        {compact ? "Запустить поиск" : "Искать"}
      </button>
    </form>
  );
}
