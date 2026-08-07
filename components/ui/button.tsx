import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary";
};

const variants = {
  primary:
    "border-primary bg-primary text-surface hover:bg-primaryDark hover:border-primaryDark",
  secondary:
    "border-border bg-surface text-primary hover:border-accent hover:bg-subtle"
};

export function ButtonLink({ className, variant = "primary", ...props }: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "group inline-flex h-11 items-center justify-center rounded-smds border px-5 text-sm font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function TextLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "font-semibold text-primary underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent",
        className
      )}
      {...props}
    />
  );
}
