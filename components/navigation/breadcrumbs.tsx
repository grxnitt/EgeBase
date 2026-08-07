import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Хлебные крошки" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li className="flex items-center gap-2" key={`${item.label}-${index}`}>
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href ? (
              <Link className="transition-colors hover:text-accent" href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span className="text-text">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
