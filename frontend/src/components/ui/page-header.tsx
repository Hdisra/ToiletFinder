import type { ReactNode } from "react";
import { Icon, type IconName } from "../icons";

/** Title at the top of a page: a blue icon badge, the title and, on the right, optional `actions` (buttons). */
export function PageHeader({
  icon,
  title,
  actions,
}: {
  icon: IconName;
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-400 text-white shadow-md shadow-brand-300">
          <Icon name={icon} className="h-4 w-4" />
        </span>
        <h1 className="text-xl font-semibold text-ink">{title}</h1>
      </div>
      {actions}
    </div>
  );
}
