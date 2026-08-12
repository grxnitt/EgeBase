import Link from "next/link";
import { siteConfig } from "@/config/site";
import { AuthNav } from "@/components/auth/auth-nav";
import { SearchInput } from "@/components/search/search-input";

export function Header() {
  return (
    <header className="z-30 border-b border-border/80 bg-surface/95 backdrop-blur-sm md:sticky md:top-0">
      <div className="container-shell flex min-h-20 flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="flex items-center justify-between gap-4 lg:contents">
          <Link aria-label="EgeBase, на главную" className="group shrink-0" href="/">
            <span className="block font-serif text-2xl font-bold leading-none">
              <span className="text-primaryDark">Ege</span>
              <span className="text-accent">[Base]</span>
            </span>
            <span className="mt-1 block max-w-[190px] text-[0.52rem] font-semibold uppercase tracking-[0.08em] text-muted">
              теория ЕГЭ по обществознанию
            </span>
          </Link>
          <div className="lg:hidden">
            <AuthNav />
          </div>
        </div>
        <nav aria-label="Главная навигация" className="flex items-center gap-4 overflow-x-auto pb-1 text-sm font-semibold [scrollbar-width:none] sm:gap-6 lg:gap-8 lg:overflow-visible lg:pb-0">
          {siteConfig.nav.map((item) => (
            <Link className="shrink-0 text-text transition-colors hover:text-accent" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="w-full lg:w-64">
          <SearchInput compact />
        </div>
        <div className="hidden lg:block">
          <AuthNav />
        </div>
      </div>
    </header>
  );
}
