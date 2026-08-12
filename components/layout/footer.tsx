import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-28 border-t border-border bg-surface">
      <div className="container-shell grid gap-8 py-10 sm:grid-cols-[1fr_auto] sm:gap-10 sm:py-12">
        <div>
          <p className="font-serif text-2xl font-bold">
            <span className="text-primaryDark">Ege</span>
            <span className="text-accent">[Base]</span>
          </p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            EgeBase — справочник теории ЕГЭ по обществознанию: темы, определения,
            классификации и примеры в единой структуре для подготовки к экзамену.
          </p>
        </div>
        <nav aria-label="Навигация в футере" className="flex flex-wrap items-start gap-x-7 gap-y-3 text-sm font-semibold">
          <Link className="transition-colors hover:text-accent" href="/theory">
            Теория
          </Link>
          <Link className="transition-colors hover:text-accent" href="/dictionary">
            Словарь
          </Link>
          <Link className="transition-colors hover:text-accent" href="/tasks">
            Задания
          </Link>
        </nav>
      </div>
    </footer>
  );
}
