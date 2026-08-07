"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomeCatalogCta() {
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cta = ctaRef.current;

    if (!cta) {
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
        rootMargin: "0px 0px -24% 0px",
        threshold: 0.85
      }
    );

    observer.observe(cta);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="inline-flex" ref={ctaRef}>
      <ButtonLink className={cn("home-catalog-cta", isVisible && "is-visible")} href="/theory">
        Открыть каталог <ArrowRight aria-hidden="true" className="motion-arrow ml-2 h-4 w-4" />
      </ButtonLink>
    </div>
  );
}
