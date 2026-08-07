import Link from "next/link";

export function RelatedTasksPanel({ tasks = [] }: { tasks?: number[] }) {
  return (
    <section className="mt-8 border border-border bg-surface p-5">
      <h2 className="text-base font-bold text-primaryDark">Связанные задания</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {tasks.map((task) => (
          <Link
            className="inline-flex h-8 min-w-9 items-center justify-center rounded-smds border border-accent/35 bg-background px-3 text-xs font-bold text-primary transition-colors hover:border-accent hover:bg-subtle hover:text-accent"
            href="/tasks"
            key={task}
          >
            {task}
          </Link>
        ))}
      </div>
      <p className="mt-4 text-sm leading-6 text-muted">Задания по этой теме скоро появятся.</p>
      <Link className="group mt-4 inline-flex text-sm font-semibold text-primary transition-colors hover:text-accent" href="/tasks">
        Открыть задания <span aria-hidden="true" className="motion-arrow ml-1">→</span>
      </Link>
    </section>
  );
}
