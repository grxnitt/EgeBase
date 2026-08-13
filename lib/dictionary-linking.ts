import type { DictionaryTerm } from "./dictionary";

export type DictionaryTermTextPart = {
  text: string;
  slug: string | null;
};

type TermVariant = {
  normalized: string;
  slug: string;
};

function normalizeTermText(value: string) {
  return value.toLocaleLowerCase("ru-RU").replaceAll("ё", "е");
}

function isTermBoundary(character: string | undefined) {
  return !character || !/[0-9A-Za-zА-Яа-яЁё]/.test(character);
}

function getTermVariants(terms: DictionaryTerm[], excludedSlugs?: ReadonlySet<string>) {
  return terms
    .filter((term) => term.linkable !== false && !excludedSlugs?.has(term.slug))
    .flatMap((term) =>
      [term.title, ...(term.aliases ?? [])].map((variant) => ({
        normalized: normalizeTermText(variant),
        slug: term.slug
      }))
    )
    .filter((variant) => variant.normalized.trim().length > 2)
    .sort((a, b) => b.normalized.length - a.normalized.length);
}

function findTermAtPosition(normalizedText: string, index: number, variants: TermVariant[]) {
  for (const variant of variants) {
    if (!normalizedText.startsWith(variant.normalized, index)) {
      continue;
    }

    const before = normalizedText[index - 1];
    const after = normalizedText[index + variant.normalized.length];

    if (isTermBoundary(before) && isTermBoundary(after)) {
      return variant;
    }
  }

  return null;
}

export function splitDictionaryTermText(
  text: string,
  terms: DictionaryTerm[],
  excludedSlugs?: ReadonlySet<string>
): DictionaryTermTextPart[] {
  if (!text) {
    return [{ text, slug: null }];
  }

  const variants = getTermVariants(terms, excludedSlugs);
  if (!variants.length) {
    return [{ text, slug: null }];
  }

  const normalizedText = normalizeTermText(text);
  const parts: DictionaryTermTextPart[] = [];
  let plainStart = 0;
  let index = 0;

  while (index < text.length) {
    const match = findTermAtPosition(normalizedText, index, variants);

    if (!match) {
      index += 1;
      continue;
    }

    const matchEnd = index + match.normalized.length;
    if (plainStart < index) {
      parts.push({ text: text.slice(plainStart, index), slug: null });
    }

    parts.push({ text: text.slice(index, matchEnd), slug: match.slug });
    index = matchEnd;
    plainStart = matchEnd;
  }

  if (plainStart < text.length) {
    parts.push({ text: text.slice(plainStart), slug: null });
  }

  return parts.length ? parts : [{ text, slug: null }];
}
