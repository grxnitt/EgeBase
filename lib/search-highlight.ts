export type HighlightedTextPart = {
  text: string;
  highlighted: boolean;
};

function normalizeForHighlight(value: string) {
  return value.toLocaleLowerCase("ru-RU").replaceAll("ё", "е");
}

export function splitHighlightedText(text: string, query: string): HighlightedTextPart[] {
  const normalizedQuery = normalizeForHighlight(query.trim());

  if (!text || !normalizedQuery) {
    return [{ text, highlighted: false }];
  }

  const normalizedText = normalizeForHighlight(text);
  const parts: HighlightedTextPart[] = [];
  let searchFrom = 0;

  while (searchFrom < text.length) {
    const matchIndex = normalizedText.indexOf(normalizedQuery, searchFrom);

    if (matchIndex === -1) {
      parts.push({ text: text.slice(searchFrom), highlighted: false });
      break;
    }

    if (matchIndex > searchFrom) {
      parts.push({ text: text.slice(searchFrom, matchIndex), highlighted: false });
    }

    const matchEnd = matchIndex + normalizedQuery.length;
    parts.push({ text: text.slice(matchIndex, matchEnd), highlighted: true });
    searchFrom = matchEnd;
  }

  return parts.filter((part) => part.text.length > 0);
}
