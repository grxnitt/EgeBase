"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { saveReadingReturn } from "@/components/navigation/reading-position-restorer";
import { getSafeDictionaryReturnHref, getSafeDictionaryReturnScroll } from "@/lib/dictionary-return";

function getSearchParamValue(value: string | null) {
  return value ?? undefined;
}

export function DictionaryReturnLink() {
  const searchParams = useSearchParams();
  const href = getSafeDictionaryReturnHref(getSearchParamValue(searchParams.get("from")));
  const scrollY = getSafeDictionaryReturnScroll(getSearchParamValue(searchParams.get("scroll")));

  function handleClick() {
    if (href && scrollY !== null) {
      saveReadingReturn(href, scrollY);
    }
  }

  if (!href) {
    return null;
  }

  return (
    <Link
      className="mb-4 mt-3 inline-flex items-center text-sm font-semibold text-primary/80 underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
      href={href}
      onClick={handleClick}
    >
      ← Вернуться к месту в статье
    </Link>
  );
}
