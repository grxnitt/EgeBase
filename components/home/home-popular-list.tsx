"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TopicSearchItem } from "@/lib/content/types";

type PopularItemStyle = CSSProperties & {
  "--popular-delay": string;
};

export function HomePopularList({ topics }: { topics: TopicSearchItem[] }) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const grid = gridRef.current;

    if (!grid) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.2
      }
    );

    observer.observe(grid);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-6 pt-8" ref={gridRef}>
      {topics.map((topic, index) => (
        <Link
          className={cn(
            "home-popular-item group rounded-smds border border-border bg-background p-6 transition-colors hover:border-accent",
            isVisible && "is-visible"
          )}
          href={topic.href ?? "/theory/sociology"}
          key={topic.slug}
          style={{ "--popular-delay": `${index * 130}ms` } as PopularItemStyle}
        >
          <span className="font-serif text-3xl text-accent">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-8 text-2xl font-semibold">{topic.title}</h3>
          <p className="mt-3 text-sm leading-6 text-muted">
            Ключевая тема раздела «{topic.section}» для повторения теории.
          </p>
        </Link>
      ))}
    </div>
  );
}
