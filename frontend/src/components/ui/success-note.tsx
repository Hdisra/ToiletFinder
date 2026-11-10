import type { ReactNode } from "react";

/** Green message box for confirmations. */
export function SuccessNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl bg-free/10 px-4 py-3 text-sm font-medium text-free">
      {children}
    </p>
  );
}
