import { ArticleTable, CommonMistakeBlock, DefinitionBlock, ExamImportantBlock } from "./blocks";
import { DictionaryLinkedText } from "./dictionary-linked-text";
import { createUniqueHeadingSlugger } from "@/lib/utils";

export function createMdxComponents() {
  const getUniqueSlug = createUniqueHeadingSlugger();
  const linkedTermSlugs = new Set<string>();

  function H2({ children }: { children: React.ReactNode }) {
    const id = getUniqueSlug(String(children));
    return <h2 id={id}>{children}</h2>;
  }

  function H3({ children }: { children: React.ReactNode }) {
    const id = getUniqueSlug(String(children));
    return <h3 id={id}>{children}</h3>;
  }

  function P({ children }: { children: React.ReactNode }) {
    return (
      <p>
        <DictionaryLinkedText linkedTermSlugs={linkedTermSlugs}>{children}</DictionaryLinkedText>
      </p>
    );
  }

  function Li({ children }: { children: React.ReactNode }) {
    return (
      <li>
        <DictionaryLinkedText linkedTermSlugs={linkedTermSlugs}>{children}</DictionaryLinkedText>
      </li>
    );
  }

  return {
    h2: H2,
    h3: H3,
    p: P,
    li: Li,
    DefinitionBlock,
    ExamImportantBlock,
    CommonMistakeBlock,
    ArticleTable
  };
}

export const mdxComponents = createMdxComponents();
