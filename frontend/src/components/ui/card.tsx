import type { ReactNode } from "react";

/** White rounded box that groups content. With a `title` it also shows a header (plus optional subtitle and `action`, e.g. a button). */
export function Card({
  title,
  subtitle,
  action,
  className = "",
  children,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`rounded-2xl bg-white p-6 shadow-sm ${className}`}>
      {title ? (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">{title}</h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-muted">{subtitle}</p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}
