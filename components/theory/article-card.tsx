import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { TopicSearchItem } from "@/lib/content/types";

export function ArticleCard({ topic, index }: { topic: TopicSearchItem; index: number }) {
  const number = String(index + 1).padStart(2, "0");

  if (topic.status === "coming-soon") {
    return (
      <div className="grid grid-cols-[42px_1fr] gap-4 border-t border-border py-6 opacity-70 sm:grid-cols-[72px_1fr_auto] sm:gap-5">
        <span className="font-serif text-2xl text-muted">{number}</span>
        <div>
          <h3 className="text-xl font-semibold">{topic.title}</h3>
          <p className="mt-2 text-sm text-muted">Материал готовится к публикации.</p>
        </div>
        <Badge className="col-start-2 w-fit sm:col-start-auto">Скоро</Badge>
      </div>
    );
  }

  return (
    <Link
      className="group grid grid-cols-[42px_1fr] gap-4 border-t border-border py-6 transition-colors hover:border-accent sm:grid-cols-[72px_1fr_auto] sm:gap-5"
      href={topic.href ?? "/theory/sociology"}
    >
      <span className="font-serif text-2xl text-accent">{number}</span>
      <div>
        <h3 className="text-xl font-semibold transition-colors group-hover:text-accent">{topic.title}</h3>
        <p className="mt-2 text-sm text-muted">Открыть материал раздела «{topic.section}».</p>
      </div>
      <span className="col-start-2 text-sm font-semibold text-accent sm:col-start-auto">
        Читать <span aria-hidden="true" className="motion-arrow">→</span>
      </span>
    </Link>
  );
}
