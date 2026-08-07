import type { Metadata } from "next";
import { FileClock } from "lucide-react";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Задания",
  description: "Раздел заданий EgeBase. База заданий появится позже.",
  alternates: { canonical: "/tasks" }
};

export default function TasksPage() {
  return (
    <div className="container-shell py-12">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Задания" }]} />
      <section className="grid min-h-[520px] place-items-center py-16">
        <div className="max-w-2xl border-y border-border py-14 text-center">
          <FileClock aria-hidden="true" className="mx-auto h-10 w-10 text-accent" />
          <p className="editorial-label mt-8">Раздел в подготовке</p>
          <h1 className="mt-4 font-serif text-6xl leading-tight">База заданий скоро появится</h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted">
            Мы работаем над заданиями и подробными разборами.
          </p>
          <ButtonLink className="mt-9" href="/theory">
            Вернуться к теории
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
