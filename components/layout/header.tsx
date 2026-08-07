import Link from "next/link";
import { siteConfig } from "@/config/site";
import { AuthNav } from "@/components/auth/auth-nav";
import { SearchInput } from "@/components/search/search-input";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-surface/95 backdrop-blur-sm">
      <div className="container-shell flex h-20 items-center justify-between gap-6">
        <Link aria-label="EgeBase, на главную" className="group" href="/">
          <span className="block font-serif text-2xl font-bold leading-none">
            <span className="text-primaryDark">Ege</span>
            <span className="text-accent">[Base]</span>
          </span>
          <span className="mt-1 block max-w-[190px] text-[0.52rem] font-semibold uppercase tracking-[0.08em] text-muted">
            теория ЕГЭ по обществознанию
          </span>
        </Link>
        <nav aria-label="Главная навигация" className="flex items-center gap-8 text-sm font-semibold">
          {siteConfig.nav.map((item) => (
            <Link className="text-text transition-colors hover:text-accent" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="w-64">
          <SearchInput compact />
        </div>
        <AuthNav />
      </div>
    </header>
  );
}
