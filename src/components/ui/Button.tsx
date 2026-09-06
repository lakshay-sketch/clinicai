import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base = "inline-flex items-center justify-center h-10 px-4 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed";
const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-ink/90",
  secondary: "border border-line-strong text-ink hover:border-ink",
  ghost: "text-teal hover:underline underline-offset-2",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function LinkButton({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
