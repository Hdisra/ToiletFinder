import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import icon from "@/assets/icon.png";
import { useAuth } from "@/features/auth/use-auth";
import { Icon, type IconName } from "./icons";

const NAV: {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
  /** Extra paths that also count as this item being active. */
  alsoActive?: RegExp;
}[] = [
  { to: "/", label: "Panel", icon: "home", end: true },
  {
    to: "/bathrooms",
    label: "Baños",
    icon: "pin",
    end: true,
    alsoActive: /^\/bathrooms\/\d+\/edit$/,
  },
  { to: "/bathrooms/new", label: "Agregar baño", icon: "plus" },
  { to: "/ratings", label: "Calificaciones", icon: "star" },
];

export function AppLayout() {
  const { state, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const email = state.status === "signedIn" ? state.user.email : "";

  return (
    <div className="min-h-screen">
      {menuOpen ? (
        <div
          className="fixed inset-0 z-20 bg-ink/40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-white shadow-sm transition-transform lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-6">
          <img src={icon} alt="" className="h-11 w-11 rounded-xl shadow-md" />
          <div>
            <p className="text-lg font-bold leading-tight text-brand-700">
              Toilet Finder
            </p>
            <p className="text-xs text-muted">Administración</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-4">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive || item.alsoActive?.test(pathname)
                    ? "bg-brand-50 text-brand-600"
                    : "text-ink hover:bg-brand-50/60"
                }`
              }
            >
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-brand-100 p-4">
          <p className="truncate text-sm font-semibold text-ink">{email}</p>
          <p className="mb-3 text-xs text-muted">Administrador</p>
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted transition hover:bg-brand-50 hover:text-ink"
          >
            <Icon name="logout" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="flex h-16 items-center bg-white px-4 shadow-sm lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="text-muted hover:text-ink"
            aria-label="Abrir menú"
          >
            <Icon name="menu" className="h-6 w-6" />
          </button>
          <p className="ml-4 font-bold text-brand-700">Toilet Finder</p>
        </header>

        <main className="mx-auto max-w-6xl p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
