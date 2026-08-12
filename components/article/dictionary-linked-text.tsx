import Link from "next/link";
import { Children, isValidElement, type ReactNode } from "react";
import { dictionaryTerms } from "@/lib/dictionary";
import { splitDictionaryTermText } from "@/lib/dictionary-linking";

type DictionaryLinkedTextProps = {
  children: ReactNode;
  linkedTermSlugs: Set<string>;
};

function renderDictionaryLinkedNode(node: ReactNode, linkedTermSlugs: Set<string>): ReactNode {
  if (typeof node === "string") {
    const parts = splitDictionaryTermText(node, dictionaryTerms, linkedTermSlugs);

    return parts.map((part, index) => {
      if (!part.slug) {
        return part.text;
      }

      linkedTermSlugs.add(part.slug);

      return (
        <Link className="dictionary-term-link" href={`/dictionary#${part.slug}`} key={`${part.slug}-${index}`}>
          {part.text}
        </Link>
      );
    });
  }

  if (Array.isArray(node)) {
    return node.map((child, index) => (
      <DictionaryLinkedText linkedTermSlugs={linkedTermSlugs} key={index}>
        {child}
      </DictionaryLinkedText>
    ));
  }

  if (isValidElement(node)) {
    return node;
  }

  return node;
}

export function DictionaryLinkedText({ children, linkedTermSlugs }: DictionaryLinkedTextProps) {
  return <>{Children.toArray(children).map((child) => renderDictionaryLinkedNode(child, linkedTermSlugs))}</>;
}
