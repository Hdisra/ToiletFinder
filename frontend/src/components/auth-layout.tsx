import type { ReactNode } from "react";
import logo from "@/assets/logo.png";

/** Login-style screen: gradient background and a white card split in two, like the reference. */
export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 p-4">
      <span className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
      <span className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-white/10" />

      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
        <div className="hidden items-center justify-center bg-brand-50 p-10 md:flex">
          <img
            src={logo}
            alt="Toilet Finder"
            className="w-full max-w-xs rounded-3xl shadow-xl shadow-brand-300"
          />
        </div>

        <div className="flex flex-col justify-center p-8 md:p-12">
          <img
            src={logo}
            alt="Toilet Finder"
            className="mx-auto mb-6 h-28 w-28 rounded-2xl md:hidden"
          />
          <span className="mb-3 block h-1 w-10 rounded-full bg-brand-500" />
          <h1 className="text-2xl font-semibold text-ink">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted">{subtitle}</p>
          ) : null}
          <div className="mt-6 flex flex-col gap-4">{children}</div>
        </div>
      </div>
    </main>
  );
}
