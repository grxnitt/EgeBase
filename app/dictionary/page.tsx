import type { Metadata } from "next";
import { BookOpenText } from "lucide-react";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Словарь",
  description: "Раздел словаря EgeBase. Ключевые понятия появятся позже.",
  alternates: { canonical: "/dictionary" }
};

export default function DictionaryPage() {
  return (
    <div className="container-shell py-12">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Словарь" }]} />
      <section className="grid min-h-[520px] place-items-center py-16">
        <div className="max-w-2xl border-y border-border py-14 text-center">
          <BookOpenText aria-hidden="true" className="mx-auto h-10 w-10 text-accent" />
          <p className="editorial-label mt-8">Раздел в подготовке</p>
          <h1 className="mt-4 font-serif text-6xl leading-tight">Словарь скоро появится</h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted">
            Мы собираем короткие определения и ключевые понятия, чтобы к ним было удобно
            возвращаться при повторении.
          </p>
          <ButtonLink className="mt-9" href="/theory">
            Вернуться к теории
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
