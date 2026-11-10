import type { ReactNode } from "react";

/** Red message box for errors. */
export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
      {children}
    </p>
  );
}
