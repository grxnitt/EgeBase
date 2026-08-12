"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type HomeStructureItem = {
  title: string;
  text: string;
};

const structureItems: HomeStructureItem[] = [
  {
    title: "Только актуальная теория для ЕГЭ-2027",
    text: "Материалы собраны с опорой на кодификатор и требования ФИПИ."
  },
  {
    title: "Структура без лишнего",
    text: "Темы разбиты на определения, признаки, классификации, примеры и важные экзаменационные акценты."
  },
  {
    title: "Удобно повторять перед экзаменом",
    text: "Каждый материал помогает быстро вернуться к главному и связать тему с заданиями ЕГЭ."
  },
  {
    title: "Единый справочник по обществознанию",
    text: "Разделы постепенно собираются в одну понятную базу: человек и общество, социология, экономика, политика и право."
  }
];

type StructureItemStyle = CSSProperties & {
  "--structure-delay": string;
};

export function HomeStructureList() {
  const listRef = useRef<HTMLOListElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const list = listRef.current;

    if (!list) {
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
        threshold: 0.25
      }
    );

    observer.observe(list);

    return () => observer.disconnect();
  }, []);

  return (
    <ol className="space-y-6" ref={listRef}>
      {structureItems.map((item, index) => (
        <li
          className={cn(
            "home-structure-item grid grid-cols-[34px_1fr] gap-4 border-t border-border pt-5 sm:grid-cols-[40px_1fr] sm:gap-5",
            isVisible && "is-visible"
          )}
          key={item.title}
          style={{ "--structure-delay": `${index * 130}ms` } as StructureItemStyle}
        >
          <span className="font-serif text-2xl text-accent">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span>
            <strong className="block text-lg">{item.title}</strong>
            <span className="mt-2 block leading-7 text-muted">{item.text}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
