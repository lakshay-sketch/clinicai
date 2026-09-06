import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-10 border border-line-strong bg-paper px-3 text-sm text-ink placeholder:text-ink-50 ${className}`}
      {...props}
    />
  );
}
