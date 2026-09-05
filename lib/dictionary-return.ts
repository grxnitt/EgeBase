export function getSafeDictionaryReturnHref(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  try {
    const parsed = new URL(value, "https://ege-base.local");

    if (parsed.origin !== "https://ege-base.local") {
      return null;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function getSafeDictionaryReturnScroll(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const scroll = Number(value);

  if (!Number.isFinite(scroll) || scroll < 0) {
    return null;
  }

  return Math.round(scroll);
}

export function buildDictionaryTermHrefWithReturn(slug: string, from: string, scrollY: number) {
  const params = new URLSearchParams();
  const safeFrom = getSafeDictionaryReturnHref(from);

  if (safeFrom) {
    params.set("from", safeFrom);
  }

  const safeScrollY = getSafeDictionaryReturnScroll(String(scrollY));

  if (safeScrollY !== null) {
    params.set("scroll", String(safeScrollY));
  }

  const query = params.toString();

  return `/dictionary/${slug}${query ? `?${query}` : ""}`;
}
