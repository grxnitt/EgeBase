"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/content/types";
import { cn } from "@/lib/utils";

export function TableOfContents({ items = [] }: { items?: TocItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  function highlightHeading(id: string) {
    const heading = document.getElementById(id);
    if (!heading) {
      return;
    }

    heading.classList.remove("article-heading-target");
    window.setTimeout(() => heading.classList.add("article-heading-target"), 20);
    window.setTimeout(() => heading.classList.remove("article-heading-target"), 2400);
  }

  useEffect(() => {
    if (!items.length) {
      return;
    }

    const visibleHeadings = new Map<string, number>();
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));

    if (!headings.length) {
      return;
    }

    const setActiveFromHash = () => {
      const hashId = decodeURIComponent(window.location.hash.replace("#", ""));
      if (hashId && items.some((item) => item.id === hashId)) {
        setActiveId(hashId);
      }
    };

    setActiveFromHash();
    window.addEventListener("hashchange", setActiveFromHash);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleHeadings.set(entry.target.id, entry.boundingClientRect.top);
          } else {
            visibleHeadings.delete(entry.target.id);
          }
        });

        const nextActive = [...visibleHeadings.entries()].sort((a, b) => a[1] - b[1])[0]?.[0];
        if (nextActive) {
          setActiveId(nextActive);
        }
      },
      {
        rootMargin: "-22% 0px -62% 0px",
        threshold: 0
      }
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => {
      window.removeEventListener("hashchange", setActiveFromHash);
      observer.disconnect();
    };
  }, [items]);

  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-primaryDark">
        Оглавление
      </p>
      <div className="mt-3 h-px bg-accent/45" />
      <ol className="mt-5 space-y-3 text-sm">
        {items.map((item) => {
          const isActive = activeId === item.id;

          return (
            <li key={item.id}>
              <a
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "relative block rounded-smds py-1 pl-3 font-semibold leading-5 text-primaryDark transition-[color,background-color,transform] duration-[260ms] ease-[var(--ease-soft)] before:absolute before:left-0 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-accent before:opacity-0 before:transition-[opacity,transform] before:duration-[260ms] before:ease-[var(--ease-soft)] hover:translate-x-0.5 hover:bg-subtle/45 hover:text-accent",
                  isActive && "bg-subtle/55 text-accent before:scale-110 before:opacity-100"
                )}
                href={`#${item.id}`}
                onClick={() => {
                  setActiveId(item.id);
                  highlightHeading(item.id);
                }}
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
