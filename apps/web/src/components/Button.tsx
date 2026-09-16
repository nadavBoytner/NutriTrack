import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "btn-primary-gradient text-on-fill",
  ghost: "glass-panel !rounded-full text-ink hover:bg-white/10",
  danger: "bg-transparent text-warn border border-transparent hover:bg-warn-soft",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
