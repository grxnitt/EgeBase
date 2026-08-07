export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function createUniqueHeadingSlugger() {
  const counts = new Map<string, number>();

  return (value: string) => {
    const base = slugifyHeading(value) || "section";
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);

    return count === 0 ? base : `${base}-${count + 1}`;
  };
}

export function formatExamYear(year: number) {
  return `Актуально для ЕГЭ-${year}`;
}
