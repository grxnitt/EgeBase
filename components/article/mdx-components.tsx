import { ArticleTable, CommonMistakeBlock, DefinitionBlock, ExamImportantBlock } from "./blocks";
import { createUniqueHeadingSlugger } from "@/lib/utils";

export function createMdxComponents() {
  const getUniqueSlug = createUniqueHeadingSlugger();

  function H2({ children }: { children: React.ReactNode }) {
    const id = getUniqueSlug(String(children));
    return <h2 id={id}>{children}</h2>;
  }

  function H3({ children }: { children: React.ReactNode }) {
    const id = getUniqueSlug(String(children));
    return <h3 id={id}>{children}</h3>;
  }

  return {
    h2: H2,
    h3: H3,
    DefinitionBlock,
    ExamImportantBlock,
    CommonMistakeBlock,
    ArticleTable
  };
}

export const mdxComponents = createMdxComponents();
