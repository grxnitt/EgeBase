"use client";

import { useId, useState } from "react";
import { ChevronDown, ListChecks } from "lucide-react";
import type { ExamPlanTask } from "@/lib/content/types";
import { cn } from "@/lib/utils";

function PlanDisclosure({ plan, index }: { plan: ExamPlanTask; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  return (
    <div className="plan-disclosure rounded-smds border border-border bg-surface">
      <button
        aria-controls={contentId}
        aria-expanded={isOpen}
        className="group flex w-full items-center justify-between gap-5 px-5 py-4 text-left transition-colors duration-200 hover:border-accent hover:bg-subtle/45"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="min-w-0">
          <span className="editorial-label">План {index + 1}</span>
          <span className="mt-1 block text-xl font-semibold leading-snug text-primaryDark">
            {plan.title}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-primary group-hover:text-accent">
          {isOpen ? "Скрыть план" : "Раскрыть план"}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "h-4 w-4 transition-transform duration-[420ms] ease-[var(--ease-soft)]",
              isOpen && "rotate-180"
            )}
          />
        </span>
      </button>

      <div
        aria-hidden={!isOpen}
        className={cn(
          "plan-disclosure-panel grid overflow-hidden border-t",
          isOpen
            ? "grid-rows-[1fr] border-border opacity-100"
            : "grid-rows-[0fr] border-transparent opacity-0"
        )}
        id={contentId}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={cn(
              "plan-disclosure-content bg-subtle/45 px-6 pb-6 pt-5",
              isOpen ? "translate-y-0 opacity-100" : "-translate-y-1.5 opacity-0"
            )}
          >
            <div className="border-l-2 border-accent pl-5">
              <p className="text-base leading-7 text-muted">{plan.prompt}</p>

              <ol className="mt-6 space-y-5 text-base leading-7 text-text">
                {plan.points.map((point, pointIndex) => (
                  <li key={point.title}>
                    <p className="font-semibold text-primaryDark">
                      {pointIndex + 1}. {point.title}
                    </p>
                    {point.children?.length ? (
                      <ol className="mt-2 space-y-1 pl-5 text-muted" type="a">
                        {point.children.map((child) => (
                          <li key={child}>{child}</li>
                        ))}
                      </ol>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlanTaskDialog({ plans }: { plans: ExamPlanTask[] }) {
  return (
    <section className="plan-task-section my-10 border-y border-border py-7">
      <div className="mb-5 flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-smds bg-subtle text-accent">
          <ListChecks aria-hidden="true" className="h-4 w-4" />
        </span>
        <div>
          <p className="editorial-label">Задание 24</p>
          <h2 className="mt-1 font-serif text-3xl leading-tight text-primaryDark">
            Планы по теме
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Скомпилировано по близким формулировкам планов прошлых лет.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {plans.map((plan, index) => (
          <PlanDisclosure index={index} key={plan.title} plan={plan} />
        ))}
      </div>
    </section>
  );
}
