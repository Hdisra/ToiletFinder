/** Formatter for "7 nov 2026" (Spanish, locale-aware). */
const dateFormat = new Intl.DateTimeFormat('es', { dateStyle: 'medium' })
/** Formatter for "7 nov". */
const dayShort = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' })
/** Formatter for "sábado, 7 de noviembre". */
const dayLong = new Intl.DateTimeFormat('es', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

/** Date of an ISO timestamp, shown in the browser's timezone, e.g. "7 nov 2026". */
export const formatDate = (iso: string) => dateFormat.format(new Date(iso))

/** A calendar day sent as "YYYY-MM-DD". Built as a local date: parsing it directly would shift it a day. */
const parseDay = (day: string) => {
  const [year, month, date] = day.split('-').map(Number)
  return new Date(year, month - 1, date)
}

/** "7 nov" */
export const formatDayShort = (day: string) => dayShort.format(parseDay(day))

/** "sábado, 7 de noviembre" */
export const formatDayLong = (day: string) => dayLong.format(parseDay(day))

/** Score with one decimal ("8.5"), or a dash when there is none. Accepts the decimal text the API sends. */
export const formatScore = (value: string | number | null) =>
  value === null ? '—' : Number(value).toFixed(1)

/** "Gratis" for free bathrooms, otherwise the price with two decimals ("$10.50"). */
export const formatPrice = (isFree: boolean, price: string | null) =>
  isFree ? 'Gratis' : `$${Number(price).toFixed(2)}`
