"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type FlashcardTerm = {
  title: string;
  slug: string;
  section: string;
  definition: string;
  features?: string[];
};

type FlashcardsTrainerProps = {
  sections: Array<{ section: string; count: number }>;
  terms: FlashcardTerm[];
};

function shuffleTerms(terms: FlashcardTerm[]) {
  const shuffled = [...terms];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

const activeChipClass = "border-accent bg-accent/16 text-primaryDark shadow-[inset_0_0_0_1px_rgba(211,78,43,0.36)]";
const inactiveChipClass = "border-border bg-background text-primary hover:border-accent hover:bg-subtle";

function SelectedChipMark() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-[0.62rem] font-bold leading-none text-surface"
    >
      ✓
    </span>
  );
}

export function FlashcardsTrainer({ sections, terms }: FlashcardsTrainerProps) {
  const [selectedSection, setSelectedSection] = useState("all");
  const [selectedCount, setSelectedCount] = useState(10);
  const [sessionTerms, setSessionTerms] = useState<FlashcardTerm[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardHeight, setCardHeight] = useState(420);
  const frontFaceRef = useRef<HTMLSpanElement | null>(null);
  const backFaceRef = useRef<HTMLSpanElement | null>(null);

  const filteredTerms = useMemo(
    () => terms.filter((term) => selectedSection === "all" || term.section === selectedSection),
    [selectedSection, terms]
  );
  const maxCount = Math.max(filteredTerms.length, 1);
  const safeCount = Math.min(selectedCount, maxCount);
  const currentTerm = sessionTerms[currentIndex];

  useEffect(() => {
    if (!currentTerm) return;

    const activeFace = isFlipped ? backFaceRef.current : frontFaceRef.current;
    if (!activeFace) return;

    const updateHeight = () => {
      const nextHeight = Math.max(activeFace.scrollHeight + 2, 340);
      setCardHeight(nextHeight);
    };

    updateHeight();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => updateHeight());
    observer.observe(activeFace);

    return () => observer.disconnect();
  }, [currentTerm, isFlipped]);

  function startSession(count = safeCount) {
    const nextTerms = shuffleTerms(filteredTerms).slice(0, Math.min(count, filteredTerms.length));
    setSessionTerms(nextTerms);
    setCurrentIndex(0);
    setIsFlipped(false);
  }

  function selectSection(section: string) {
    setSelectedSection(section);
    setSelectedCount(10);
    setSessionTerms([]);
    setCurrentIndex(0);
    setIsFlipped(false);
  }

  function goToCard(index: number) {
    setCurrentIndex(index);
    setIsFlipped(false);
  }

  const countOptions = [5, 10, 15, 20, 30, 50].filter((count) => count <= maxCount);
  if (!countOptions.includes(maxCount) && maxCount < 50) {
    countOptions.push(maxCount);
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
      <div className="rounded-[18px] border border-border bg-surface p-5 sm:p-7">
        <p className="editorial-label">Конструктор</p>
        <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">Настрой повторение</h2>

        <div className="mt-7">
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-primaryDark">Раздел</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className={`inline-flex items-center gap-2 rounded-smds border px-4 py-2 text-sm font-semibold transition-[border-color,background-color,box-shadow,color] ${
                selectedSection === "all" ? activeChipClass : inactiveChipClass
              }`}
              onClick={() => selectSection("all")}
              type="button"
            >
              {selectedSection === "all" ? <SelectedChipMark /> : null}
              Все термины <span className="ml-1 opacity-70">{terms.length}</span>
            </button>
            {sections.map((section) => (
              <button
                className={`inline-flex items-center gap-2 rounded-smds border px-4 py-2 text-sm font-semibold transition-[border-color,background-color,box-shadow,color] ${
                  selectedSection === section.section ? activeChipClass : inactiveChipClass
                }`}
                key={section.section}
                onClick={() => selectSection(section.section)}
                type="button"
              >
                {selectedSection === section.section ? <SelectedChipMark /> : null}
                {section.section} <span className="ml-1 opacity-70">{section.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7">
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-primaryDark">Количество</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {countOptions.map((count) => (
              <button
                className={`inline-flex h-10 min-w-12 items-center justify-center gap-2 rounded-smds border px-3 text-sm font-bold transition-[border-color,background-color,box-shadow,color] ${
                  safeCount === count ? activeChipClass : inactiveChipClass
                }`}
                key={count}
                onClick={() => setSelectedCount(count)}
                type="button"
              >
                {safeCount === count ? <SelectedChipMark /> : null}
                {count}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            className="inline-flex h-12 items-center justify-center rounded-smds border border-primary bg-primary px-5 text-sm font-semibold text-surface transition-colors hover:border-primaryDark hover:bg-primaryDark"
            onClick={() => startSession(safeCount)}
            type="button"
          >
            Начать повторение
          </button>
          <button
            className="inline-flex h-12 items-center justify-center rounded-smds border border-border bg-background px-5 text-sm font-semibold text-primary transition-colors hover:border-accent hover:bg-subtle"
            onClick={() => startSession(1)}
            type="button"
          >
            Случайный термин
          </button>
        </div>
      </div>

      <div className="rounded-[18px] border border-border bg-surface p-5 sm:p-7">
        {currentTerm ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="editorial-label">
                Карточка {currentIndex + 1} / {sessionTerms.length}
              </p>
              <button
                className="text-sm font-semibold text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:text-primaryDark"
                onClick={() => startSession(sessionTerms.length)}
                type="button"
              >
                Перемешать заново
              </button>
            </div>

            <button
              className="group mt-5 block w-full [perspective:1600px]"
              onClick={() => setIsFlipped((value) => !value)}
              type="button"
            >
              <span
                className={`relative block rounded-[18px] border border-border bg-background text-left transition-[height,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] motion-reduce:transform-none motion-reduce:transition-none group-hover:border-accent ${
                  isFlipped ? "[transform:rotateY(180deg)]" : ""
                }`}
                style={{ height: `${cardHeight}px` }}
              >
                <span className="absolute inset-0 rounded-[18px] shadow-[0_18px_45px_-30px_rgba(59,37,28,0.28)] transition-shadow duration-500 group-hover:shadow-[0_20px_50px_-28px_rgba(219,90,52,0.22)]" />

                <span ref={frontFaceRef} className="absolute inset-0 flex flex-col justify-center p-7 [backface-visibility:hidden] sm:p-10">
                  <span className="editorial-label">{currentTerm.section}</span>
                  <span className="mt-6 block font-serif text-[clamp(2.2rem,8vw,4.5rem)] font-bold leading-[0.95] text-primaryDark [overflow-wrap:anywhere] sm:text-5xl sm:leading-tight">
                    {currentTerm.title}
                  </span>
                  <span className="mt-8 text-base font-semibold text-accent transition-opacity duration-300 group-hover:opacity-85">
                    Нажми, чтобы открыть ответ →
                  </span>
                </span>

                <span ref={backFaceRef} className="absolute inset-0 flex flex-col p-7 [backface-visibility:hidden] [transform:rotateY(180deg)] sm:justify-center sm:p-10">
                  <span className="editorial-label">Ответ</span>
                  <span className="mt-5 block text-xl leading-9 text-primaryDark sm:text-2xl sm:leading-10">
                    {currentTerm.definition}
                  </span>
                  {currentTerm.features?.length ? (
                    <span className="mt-7 block">
                      <span className="editorial-label">Признаки</span>
                      <span className="mt-3 block space-y-2 text-base leading-7 text-primaryDark">
                        {currentTerm.features.map((feature) => (
                          <span className="flex gap-3" key={feature}>
                            <span aria-hidden="true" className="text-accent">
                              •
                            </span>
                            {feature}
                          </span>
                        ))}
                      </span>
                    </span>
                  ) : null}
                </span>
              </span>
            </button>

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                className="inline-flex h-11 items-center justify-center rounded-smds border border-border bg-background px-5 text-sm font-semibold text-primary transition-colors hover:border-accent hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-45"
                disabled={currentIndex === 0}
                onClick={() => goToCard(currentIndex - 1)}
                type="button"
              >
                ← Назад
              </button>
              <button
                className="inline-flex h-11 items-center justify-center rounded-smds border border-primary bg-primary px-5 text-sm font-semibold text-surface transition-colors hover:border-primaryDark hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-45"
                disabled={currentIndex === sessionTerms.length - 1}
                onClick={() => goToCard(currentIndex + 1)}
                type="button"
              >
                Следующая →
              </button>
            </div>
          </>
        ) : (
          <div className="flex min-h-[360px] flex-col justify-center rounded-[18px] border border-dashed border-border bg-background p-7 sm:min-h-[480px] sm:p-10">
            <p className="editorial-label">Карточки</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
              Выбери раздел и количество
              <span className="text-accent">.</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
              На лицевой стороне будет термин, на обратной — определение и признаки для задания 18, если они есть в словаре.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
