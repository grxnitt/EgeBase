import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { TopicSearchItem } from "@/lib/content/types";

export function ArticleCard({ topic, index }: { topic: TopicSearchItem; index: number }) {
  const number = String(index + 1).padStart(2, "0");

  if (topic.status === "coming-soon") {
    return (
      <div className="grid grid-cols-[72px_1fr_auto] gap-5 border-t border-border py-6 opacity-70">
        <span className="font-serif text-2xl text-muted">{number}</span>
        <div>
          <h3 className="text-xl font-semibold">{topic.title}</h3>
          <p className="mt-2 text-sm text-muted">Материал готовится к публикации.</p>
        </div>
        <Badge>Скоро</Badge>
      </div>
    );
  }

  return (
    <Link
      className="group grid grid-cols-[72px_1fr_auto] gap-5 border-t border-border py-6 transition-colors hover:border-accent"
      href={topic.href ?? "/theory/sociology"}
    >
      <span className="font-serif text-2xl text-accent">{number}</span>
      <div>
        <h3 className="text-xl font-semibold transition-colors group-hover:text-accent">{topic.title}</h3>
        <p className="mt-2 text-sm text-muted">Открыть материал раздела «{topic.section}».</p>
      </div>
      <span className="text-sm font-semibold text-accent">
        Читать <span aria-hidden="true" className="motion-arrow">→</span>
      </span>
    </Link>
  );
}
