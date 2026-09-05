"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const storageKey = "egebase:reading-return";

type StoredReadingReturn = {
  href: string;
  scrollY: number;
};

export function saveReadingReturn(href: string, scrollY: number) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(storageKey, JSON.stringify({ href, scrollY }));
}

export function ReadingPositionRestorer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const raw = window.sessionStorage.getItem(storageKey);

    if (!raw) {
      return;
    }

    let stored: StoredReadingReturn | null = null;

    try {
      stored = JSON.parse(raw) as StoredReadingReturn;
    } catch {
      window.sessionStorage.removeItem(storageKey);
      return;
    }

    const currentSearch = searchParams.toString();
    const currentHref = `${pathname}${currentSearch ? `?${currentSearch}` : ""}`;

    if (stored?.href !== currentHref || !Number.isFinite(stored.scrollY)) {
      return;
    }

    window.sessionStorage.removeItem(storageKey);

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: Math.max(0, stored.scrollY), behavior: "auto" });
    });
  }, [pathname, searchParams]);

  return null;
}
