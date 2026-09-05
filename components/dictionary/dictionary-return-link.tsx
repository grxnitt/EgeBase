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
      className="mb-5 inline-flex items-center rounded-smds border border-border bg-surface px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-accent hover:bg-subtle hover:text-accent"
      href={href}
      onClick={handleClick}
    >
      ← Вернуться к месту в статье
    </Link>
  );
}
