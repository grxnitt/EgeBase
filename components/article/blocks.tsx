import Link from "next/link";
import { AlertTriangle, CheckCircle2, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

export function DefinitionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <aside className="my-8 rounded-smds border-l-2 border-accent bg-surface px-6 py-5">
      <p className="editorial-label">Определение</p>
      <h3 className="mt-2 text-xl font-semibold">{title}</h3>
      <div className="mt-3 text-base leading-7 text-muted">{children}</div>
    </aside>
  );
}

export function ExamImportantBlock({ children }: { children: React.ReactNode }) {
  return (
    <aside className="my-8 rounded-smds border border-border bg-subtle p-6">
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
    <aside className="my-8 rounded-smds border border-border bg-surface p-6">
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
    <div className="my-8 overflow-hidden rounded-smds border border-border bg-surface">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-subtle text-primaryDark">
          <tr>
            {columns.map((column) => (
              <th className="border-b border-border px-4 py-3 font-semibold" key={column}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr className={cn(rowIndex % 2 === 1 && "bg-subtle/45")} key={row.join("-")}>
              {row.map((cell) => (
                <td className="border-b border-border px-4 py-3 align-top text-muted" key={cell}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
