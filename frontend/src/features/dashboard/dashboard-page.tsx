import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Link } from "react-router";
import {
  Card,
  ErrorNote,
  PageHeader,
  ScoreBadge,
  Spinner,
} from "@/components/ui";
import { errorMessage } from "@/utils/errors";
import {
  formatDate,
  formatDayLong,
  formatDayShort,
  formatScore,
} from "@/utils/format";
import { categoryLabel } from "../bathrooms/categories";
import { fetchStats } from "./api";
import { BarChart, DonutChart } from "./charts";

/** Colors of the donut slices, in order (they repeat if there are more categories). */
const CATEGORY_COLORS = [
  "#5c82c9",
  "#3e9c8f",
  "#c98a2b",
  "#a6bfe8",
  "#304774",
  "#c75b5b",
  "#7f9fda",
];

/** "1 calificación" / "5 calificaciones". */
const countLabel = (count: number) =>
  `${count} ${count === 1 ? "calificación" : "calificaciones"}`;

/** Colored card with a big number, used for the four totals at the top. */
function StatCard({
  title,
  value,
  note,
  gradient,
}: {
  title: string;
  value: ReactNode;
  note: string;
  gradient: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white shadow-sm ${gradient}`}
    >
      <span className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15" />
      <span className="absolute -bottom-10 right-8 h-28 w-28 rounded-full bg-white/10" />
      <p className="relative text-sm text-white/85">{title}</p>
      <p className="relative mt-2 text-4xl font-bold">{value}</p>
      <p className="relative mt-4 text-sm font-medium text-white/85">{note}</p>
    </div>
  );
}

/** Admin home: totals, charts and the latest ratings. */
export function DashboardPage() {
  const stats = useQuery({ queryKey: ["admin", "stats"], queryFn: fetchStats });

  if (stats.isPending) {
    return (
      <div className="flex justify-center py-24 text-brand-500">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  if (stats.isError) return <ErrorNote>{errorMessage(stats.error)}</ErrorNote>;

  const {
    totals,
    ratingsPerDay,
    bathroomsByCategory,
    scoreDistribution,
    recentRatings,
  } = stats.data;
  // Ratings in the last 30 days (sum of the daily chart).
  const ratingsInPeriod = ratingsPerDay.reduce((sum, d) => sum + d.count, 0);

  return (
    <>
      <PageHeader icon="home" title="Panel" />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Baños registrados"
          value={totals.bathrooms}
          note="En todo el mapa"
          gradient="from-brand-600 to-brand-400"
        />
        <StatCard
          title="Calificaciones"
          value={totals.ratings}
          note="Enviadas por los usuarios"
          gradient="from-free to-[#7ccfc2]"
        />
        <StatCard
          title="Usuarios"
          value={totals.users}
          note="Cuentas registradas"
          gradient="from-brand-800 to-brand-500"
        />
        <StatCard
          title="Calificación promedio"
          value={
            totals.averageScore === null
              ? "—"
              : `${formatScore(totals.averageScore)} / 10`
          }
          note="De todas las calificaciones"
          gradient="from-paid to-[#e8c27d]"
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card
          title="Calificaciones por día"
          subtitle="Cuántas calificaciones enviaron los usuarios cada día, en los últimos 30 días."
          className="lg:col-span-2"
          action={
            <p className="shrink-0 text-right">
              <span className="block text-3xl font-bold leading-none text-brand-600">
                {ratingsInPeriod}
              </span>
              <span className="text-xs text-muted">en 30 días</span>
            </p>
          }
        >
          <BarChart
            labelEvery={5}
            data={ratingsPerDay.map((d, i) => ({
              key: d.day,
              label:
                i === ratingsPerDay.length - 1 ? "Hoy" : formatDayShort(d.day),
              tooltip: `${formatDayLong(d.day)}: ${countLabel(d.count)}`,
              value: d.count,
            }))}
          />
        </Card>

        <Card title="Baños por categoría">
          {bathroomsByCategory.length === 0 ? (
            <p className="text-sm text-muted">Aún no hay baños.</p>
          ) : (
            <DonutChart
              slices={bathroomsByCategory.map((c, i) => ({
                label: categoryLabel(c.category),
                value: c.count,
                color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
              }))}
            />
          )}
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card title="Distribución de calificaciones">
          <BarChart
            color="bg-free"
            data={scoreDistribution.map((d) => ({
              key: String(d.score),
              label: String(d.score),
              tooltip: `Calificación ${d.score}: ${countLabel(d.count)}`,
              value: d.count,
            }))}
          />
        </Card>

        <Card
          title="Calificaciones recientes"
          className="lg:col-span-2"
          action={
            <Link
              to="/ratings"
              className="text-sm font-semibold text-brand-600 hover:underline"
            >
              Ver todas
            </Link>
          }
        >
          {recentRatings.length === 0 ? (
            <p className="text-sm text-muted">Aún no hay calificaciones.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-brand-100 text-muted">
                  <tr>
                    <th className="py-2 pr-4 font-semibold">Baño</th>
                    <th className="py-2 pr-4 font-semibold">Usuario</th>
                    <th className="py-2 pr-4 font-semibold">Calificación</th>
                    <th className="py-2 font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRatings.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-brand-50 last:border-0"
                    >
                      <td className="py-3 pr-4 font-medium">
                        {r.bathroom.name}
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        {r.userEmail ?? "Anónimo"}
                      </td>
                      <td className="py-3 pr-4">
                        <ScoreBadge score={r.score} />
                      </td>
                      <td className="py-3 text-muted">
                        {formatDate(r.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
