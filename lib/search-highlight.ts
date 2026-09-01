export type HighlightedTextPart = {
  text: string;
  highlighted: boolean;
};

function normalizeForHighlight(value: string) {
  return value.toLocaleLowerCase("ru-RU").replaceAll("ё", "е");
}

const HIGHLIGHT_STOP_WORDS = new Set([
  "а",
  "без",
  "бы",
  "в",
  "во",
  "все",
  "всех",
  "вся",
  "всю",
  "где",
  "да",
  "для",
  "до",
  "его",
  "ее",
  "если",
  "же",
  "за",
  "и",
  "из",
  "или",
  "их",
  "к",
  "как",
  "ко",
  "ли",
  "на",
  "над",
  "не",
  "но",
  "о",
  "об",
  "обо",
  "от",
  "по",
  "под",
  "при",
  "с",
  "со",
  "то",
  "у",
  "что",
  "это"
]);

function isMeaningfulHighlightToken(token: string) {
  return token.length >= 3 && !HIGHLIGHT_STOP_WORDS.has(token);
}

function getHighlightNeedles(query: string) {
  const normalizedQuery = normalizeForHighlight(query.trim())
    .replace(/[^0-9a-zа-я]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (normalizedQuery.length < 3) {
    return [];
  }

  const words = normalizedQuery.split(/\s+/).filter(isMeaningfulHighlightToken);
  if (!words.length) {
    return [];
  }

  const endings = ["иями", "ями", "ами", "ого", "ему", "ыми", "ими", "ией", "ия", "ии", "ию", "ая", "яя", "ое", "ее", "ый", "ий", "ой", "ым", "им", "ых", "их", "ом", "ем", "ов", "ев", "ей", "а", "я", "ы", "и", "у", "ю", "е", "о"];
  const stems = words.map((word) => {
    const ending = endings.find((candidate) => word.length - candidate.length >= 4 && word.endsWith(candidate));
    return ending ? word.slice(0, -ending.length) : word;
  }).filter(isMeaningfulHighlightToken);

  return [...new Set([...words, ...stems])].sort(
    (a, b) => b.length - a.length
  );
}

export function splitHighlightedText(text: string, query: string): HighlightedTextPart[] {
  const needles = getHighlightNeedles(query);

  if (!text || !needles.length) {
    return [{ text, highlighted: false }];
  }

  const normalizedText = normalizeForHighlight(text);
  const parts: HighlightedTextPart[] = [];
  let searchFrom = 0;

  while (searchFrom < text.length) {
    const matches = needles
      .map((needle) => ({ needle, index: normalizedText.indexOf(needle, searchFrom) }))
      .filter((match) => match.index !== -1)
      .sort((a, b) => a.index - b.index || b.needle.length - a.needle.length);
    const match = matches[0];

    if (!match) {
      parts.push({ text: text.slice(searchFrom), highlighted: false });
      break;
    }

    const matchIndex = match.index;
    if (matchIndex > searchFrom) {
      parts.push({ text: text.slice(searchFrom, matchIndex), highlighted: false });
    }

    const matchEnd = matchIndex + match.needle.length;
    parts.push({ text: text.slice(matchIndex, matchEnd), highlighted: true });
    searchFrom = matchEnd;
  }

  return parts.filter((part) => part.text.length > 0);
}
