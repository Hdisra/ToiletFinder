/** One bar of a `BarChart`. */
export interface Bar {
  /** Unique id of the bar. */
  key: string;
  /** Text under the bar (only shown on some bars, see `labelEvery`). */
  label: string;
  /** Text shown when hovering the bar. */
  tooltip: string;
  /** Height of the bar (a count). */
  value: number;
}

/** Bars use at most this share of the height, leaving room for the number above them. */
const PLOT_HEIGHT_PERCENT = 85;

/**
 * Bar chart with a numeric axis, grid lines and the value written above each bar.
 * `labelEvery`: label every Nth bar, counting back from the last one.
 */
export function BarChart({
  data,
  labelEvery = 1,
  color = "bg-brand-500",
}: {
  data: Bar[];
  labelEvery?: number;
  color?: string;
}) {
  // Largest value: it sets the scale of the axis.
  const max = Math.max(1, ...data.map((d) => d.value));

  // Whole-number ticks only: counts of ratings can't be fractions.
  const ticks =
    max <= 5
      ? Array.from({ length: max + 1 }, (_, i) => i)
      : [...new Set([0, Math.round(max / 2), max])];

  /** Height (in % of the chart) of a value. */
  const position = (value: number) => (value / max) * PLOT_HEIGHT_PERCENT;

  /** Whether the bar at `index` gets a label under it. */
  const showLabel = (index: number) =>
    (data.length - 1 - index) % labelEvery === 0;

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative h-52 w-6 shrink-0">
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-0 translate-y-1/2 text-xs text-muted"
              style={{ bottom: `${position(tick)}%` }}
            >
              {tick}
            </span>
          ))}
        </div>

        <div className="relative h-52 flex-1">
          {ticks.map((tick) => (
            <div
              key={tick}
              className="absolute inset-x-0 border-t border-brand-100"
              style={{ bottom: `${position(tick)}%` }}
            />
          ))}
          <div className="absolute inset-0 flex gap-1">
            {data.map((d) => (
              <div key={d.key} title={d.tooltip} className="relative flex-1">
                <div
                  className={`absolute inset-x-0 bottom-0 rounded-t ${color}`}
                  style={{ height: `${position(d.value)}%` }}
                />
                {d.value > 0 ? (
                  <span
                    className="absolute inset-x-0 text-center text-xs font-semibold text-ink"
                    style={{ bottom: `calc(${position(d.value)}% + 2px)` }}
                  >
                    {d.value}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 flex gap-2">
        <div className="w-6 shrink-0" />
        <div className="flex flex-1 gap-1">
          {data.map((d, i) => (
            <div key={d.key} className="relative h-4 flex-1">
              {showLabel(i) ? (
                <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-muted">
                  {d.label}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** One slice of a `DonutChart`. */
export interface DonutSlice {
  label: string;
  value: number;
  /** Any CSS color, e.g. "#5c82c9". */
  color: string;
}

/** Donut chart with a legend, drawn with SVG circles. */
export function DonutChart({ slices }: { slices: DonutSlice[] }) {
  // `total` is the sum of all slices; `percentOf` turns a value into its % of the donut.
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const percentOf = (value: number) => (total ? (value / total) * 100 : 0);

  return (
    <div className="flex flex-col items-center gap-6">
      <svg viewBox="0 0 42 42" className="h-44 w-44 -rotate-90">
        <circle
          cx="21"
          cy="21"
          r="15.915"
          fill="none"
          stroke="#e3ebf8"
          strokeWidth="6"
        />
        {slices.map((slice, i) => {
          const percent = percentOf(slice.value);
          // Where this slice starts: the sum of the slices before it.
          const start = slices
            .slice(0, i)
            .reduce((sum, s) => sum + percentOf(s.value), 0);
          return (
            <circle
              key={slice.label}
              cx="21"
              cy="21"
              r="15.915"
              fill="none"
              stroke={slice.color}
              strokeWidth="6"
              strokeDasharray={`${percent} ${100 - percent}`}
              strokeDashoffset={-start}
            >
              <title>{`${slice.label}: ${slice.value}`}</title>
            </circle>
          );
        })}
      </svg>

      <ul className="w-full space-y-2 text-sm">
        {slices.map((slice) => (
          <li key={slice.label} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-muted">{slice.label}</span>
            <span className="ml-auto font-semibold text-ink">
              {total ? Math.round((slice.value / total) * 100) : 0}% ·{" "}
              {slice.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
