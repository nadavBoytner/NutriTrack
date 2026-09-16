import type { InputHTMLAttributes, ReactNode } from "react";

const inputClasses =
  "w-full border-0 border-b border-line bg-transparent py-2 text-base text-ink placeholder:text-ink-soft/60 focus:border-good focus:outline-none";

export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1 block text-sm text-ink-soft">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm text-warn">{error}</span>}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClasses} ${props.className ?? ""}`} />;
}
