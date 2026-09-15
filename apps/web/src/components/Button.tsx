import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-good text-paper hover:bg-good/90",
  ghost: "bg-transparent text-ink border border-line hover:bg-paper-raised",
  danger: "bg-transparent text-warn hover:bg-warn-soft",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
