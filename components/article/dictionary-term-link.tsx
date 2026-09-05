"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { buildDictionaryTermHrefWithReturn } from "@/lib/dictionary-return";
import { getDictionaryTermHref } from "@/lib/dictionary";

type DictionaryTermLinkProps = {
  children: React.ReactNode;
  slug: string;
};

export function DictionaryTermLink({ children, slug }: DictionaryTermLinkProps) {
  const router = useRouter();
  const href = getDictionaryTermHref(slug);

  function rememberReadingPlace(event: React.MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();

    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    router.push(buildDictionaryTermHrefWithReturn(slug, currentPath, window.scrollY));
  }

  return (
    <Link className="dictionary-term-link" href={href} onClick={rememberReadingPlace}>
      {children}
    </Link>
  );
}
