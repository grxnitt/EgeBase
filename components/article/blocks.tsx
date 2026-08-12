import Link from "next/link";
import { AlertTriangle, CheckCircle2, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

export function DefinitionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <aside className="my-8 rounded-[14px] border-l-2 border-accent bg-surface px-6 py-5">
      <p className="editorial-label">Определение</p>
      <h3 className="mt-2 text-xl font-semibold">{title}</h3>
      <div className="mt-3 text-base leading-7 text-muted">{children}</div>
    </aside>
  );
}

export function ExamImportantBlock({ children }: { children: React.ReactNode }) {
  return (
    <aside className="my-8 rounded-[14px] border border-border bg-subtle p-6">
      <div className="flex items-center gap-2 text-accent">
        <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
        <p className="font-semibold text-primaryDark">Важно для ЕГЭ</p>
      </div>
      <div className="mt-3 text-base leading-7 text-text">{children}</div>
    </aside>
  );
}

export function CommonMistakeBlock({ children }: { children: React.ReactNode }) {
  return (
    <aside className="my-8 rounded-[14px] border border-border bg-surface p-6">
      <div className="flex items-center gap-2 text-accent">
        <AlertTriangle aria-hidden="true" className="h-5 w-5" />
        <p className="font-semibold text-primaryDark">Типичная ошибка</p>
      </div>
      <div className="mt-3 text-base leading-7 text-muted">{children}</div>
    </aside>
  );
}

export function ExamTasksBlock({ tasks = [] }: { tasks?: number[] }) {
  return (
    <aside className="my-10 border-y border-border py-6">
      <div className="flex items-center gap-2 text-accent">
        <ListChecks aria-hidden="true" className="h-5 w-5" />
        <h2 className="text-2xl font-semibold text-primaryDark">Встречается в ЕГЭ</h2>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        {tasks.map((task) => (
          <Link
            className="inline-flex h-10 min-w-12 items-center justify-center rounded-smds border border-border bg-surface px-4 text-sm font-bold text-primary transition-colors hover:border-accent hover:bg-subtle hover:text-accent"
            href="/tasks"
            key={task}
          >
            {task}
          </Link>
        ))}
      </div>
    </aside>
  );
}

export function ArticleTable({
  columns = [],
  rows = []
}: {
  columns?: string[];
  rows?: string[][];
}) {
  return (
    <div className="my-8 space-y-3">
      {rows.map((row, rowIndex) => (
        <section
          className="rounded-[14px] border border-border bg-surface px-4 py-4 shadow-[0_10px_30px_rgba(68,45,35,0.035)] sm:px-5"
          key={`${rowIndex}-${row.join("-")}`}
        >
          <div className="grid gap-0 overflow-hidden rounded-[12px] sm:grid-cols-[0.95fr_1.35fr_1.35fr]">
            {row.map((cell, cellIndex) => (
              <div
                className={cn(
                  "bg-white/35 px-3 py-3 first:pt-0 last:pb-0 sm:px-5 sm:py-1 sm:first:pt-1 sm:last:pb-1",
                  cellIndex > 0 && "border-t border-border sm:border-l sm:border-t-0"
                )}
                key={`${cellIndex}-${cell}`}
              >
                {columns[cellIndex] ? (
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
                    {columns[cellIndex]}
                  </p>
                ) : null}
                <p className="mt-1 text-base leading-7 text-muted sm:text-sm sm:leading-6">{cell}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

type ArticleFactCardProps = {
  label1?: string;
  value1?: string;
  label2?: string;
  value2?: string;
  label3?: string;
  value3?: string;
  label4?: string;
  value4?: string;
};

export function ArticleFactCards({ children }: { children: React.ReactNode }) {
  return <div className="my-8 grid gap-3">{children}</div>;
}

export function ArticleFactCard({
  label1,
  value1,
  label2,
  value2,
  label3,
  value3,
  label4,
  value4
}: ArticleFactCardProps) {
  const fields = [
    { label: label1, value: value1 },
    { label: label2, value: value2 },
    { label: label3, value: value3 },
    { label: label4, value: value4 }
  ].filter((field) => field.label && field.value);

  return (
    <section className="rounded-[14px] border border-border bg-surface px-4 py-4 shadow-[0_10px_30px_rgba(68,45,35,0.035)] sm:px-5">
      <div className="grid gap-0 overflow-hidden rounded-[12px] sm:grid-cols-3">
        {fields.map((field, index) => (
          <div
            className={cn(
              "bg-white/35 px-3 py-3 first:pt-0 last:pb-0 sm:px-5 sm:py-1 sm:first:pt-1 sm:last:pb-1",
              index > 0 && "border-t border-border sm:border-l sm:border-t-0"
            )}
            key={`${field.label}-${field.value}`}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
              {field.label}
            </p>
            <p className="mt-1 text-base leading-7 text-muted sm:text-sm sm:leading-6">
              {field.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
