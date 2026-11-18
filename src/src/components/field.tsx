import type { ReactNode } from "react";

export function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted">
        {label}
      </label>
      {children}
      <p role="alert" className="mt-2 min-h-5 text-sm text-red-700">
        {error}
      </p>
    </div>
  );
}

export const inputClass =
  "w-full border-b-2 border-line bg-transparent py-3 text-lg outline-none transition placeholder:text-muted/60 focus:border-accent";
