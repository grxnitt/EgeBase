"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { ArticleCard } from "@/components/theory/article-card";
import type { TopicSearchItem } from "@/lib/content/types";

export function ArticleList({ topics }: { topics: TopicSearchItem[] }) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const list = listRef.current;

    if (!list) {
      return;
    }

    const items = Array.from(list.querySelectorAll<HTMLElement>("[data-theory-topic-item]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.18
      }
    );

    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={listRef}>
      {topics.map((topic, index) => (
        <div
          className="theory-topic-item"
          data-theory-topic-item
          key={topic.slug}
          style={{ "--topic-delay": `${(index % 4) * 90}ms` } as CSSProperties}
        >
          <ArticleCard index={index} topic={topic} />
        </div>
      ))}
    </div>
  );
}
