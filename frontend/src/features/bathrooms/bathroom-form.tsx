import { useEffect, useState, type SubmitEvent } from 'react'
import { Button, Card, ErrorNote, TextField } from '@/components/ui'
import { errorMessage } from '@/utils/errors'
import { CATEGORIES, type BathroomCategory } from './categories'
import { searchPlace } from './geocode'
import { LocationPicker, type LatLng } from './location-picker'
import type { Bathroom, BathroomInput } from './types'

/** Digits with an optional dot or comma and up to 2 decimals. Rules out "1e3", "0x10" and signs. */
const PRICE_FORMAT = /^\d{1,6}([.,]\d{1,2})?$/
/** Highest price the API accepts. */
const MAX_PRICE = 999_999

/** Shown while we ask the browser for the admin's position. */
type Locating = 'searching' | 'failed' | 'idle'

/**
 * The bathroom form with its map, used to add and to edit.
 * Adding (`locateMe`): the map starts at the admin's current position.
 * Editing (`initial`): the pin starts at the bathroom's saved location.
 */
export function BathroomForm({
  initial,
  locateMe = false,
  submitLabel,
  pending,
  error,
  onSubmit,
}: {
  initial?: Bathroom
  locateMe?: boolean
  submitLabel: string
  pending: boolean
  error: unknown
  onSubmit: (bathroom: BathroomInput) => void
}) {
  // Form fields. When editing, they start with the saved values.
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<BathroomCategory>(initial?.category ?? 'public')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [isFree, setIsFree] = useState(initial?.isFree ?? true)
  const [price, setPrice] = useState(initial?.price ? Number(initial.price).toString() : '')
  const [location, setLocation] = useState<LatLng | null>(
    initial ? { lat: initial.latitude, lng: initial.longitude } : null,
  )

  // Map search and location state: the text typed, where the map flies to, and search / geolocation status.
  const [query, setQuery] = useState('')
  const [focus, setFocus] = useState<LatLng | null>(location)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [locating, setLocating] = useState<Locating>(
    locateMe && 'geolocation' in navigator ? 'searching' : 'idle',
  )

  // Ask the browser for the admin's position once, when adding a bathroom.
  useEffect(() => {
    if (!locateMe || !('geolocation' in navigator)) return
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFocus({ lat: position.coords.latitude, lng: position.coords.longitude })
        setLocating('idle')
      },
      () => setLocating('failed'),
      { timeout: 10_000, maximumAge: 60_000 },
    )
  }, [locateMe])

  // The price is typed as text (comma or dot); it must be a positive amount with at most 2 decimals.
  const priceNumber = Number(price.replace(',', '.'))
  const priceValid =
    isFree ||
    (PRICE_FORMAT.test(price.trim()) && priceNumber > 0 && priceNumber <= MAX_PRICE)
  /** The form can be sent with a name, a pin on the map and a valid price (if paid). */
  const canSubmit = name.trim() !== '' && location !== null && priceValid

  /** Looks the typed address up and moves the map there. */
  const search = async (event: SubmitEvent) => {
    event.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setSearchError(null)
    try {
      const place = await searchPlace(query.trim())
      if (place) setFocus({ lat: place.lat, lng: place.lng })
      else setSearchError('No se encontró ese lugar. Prueba con otra dirección.')
    } catch {
      setSearchError('No se pudo buscar el lugar. Inténtalo de nuevo.')
    } finally {
      setSearching(false)
    }
  }

  /** Sends the cleaned data to `onSubmit`. */
  const submit = (event: SubmitEvent) => {
    event.preventDefault()
    if (!canSubmit || !location) return
    onSubmit({
      name: name.trim(),
      category,
      address: address.trim() || null,
      latitude: location.lat,
      longitude: location.lng,
      isFree,
      price: isFree ? undefined : priceNumber,
    })
  }

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <Card title="Datos del baño" className="lg:col-span-2">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <TextField
            label="Nombre"
            placeholder="Ej. Plaza Central – planta baja"
            maxLength={120}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="block rounded-xl border border-brand-200 bg-white px-4 pb-1.5 pt-2 focus-within:border-brand-500">
            <span className="block text-xs text-muted">Tipo de lugar</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BathroomCategory)}
              className="w-full bg-transparent py-1 text-base outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <TextField
            label="Dirección (opcional)"
            maxLength={255}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-muted">Costo</legend>
            <div className="flex gap-2">
              {[
                { free: true, label: 'Gratis' },
                { free: false, label: 'De pago' },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setIsFree(option.free)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                    isFree === option.free
                      ? 'bg-brand-500 text-white'
                      : 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          {!isFree ? (
            <TextField
              label="Precio ($)"
              inputMode="decimal"
              placeholder="Ej. 10.50"
              maxLength={10}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          ) : null}

          {error ? <ErrorNote>{errorMessage(error)}</ErrorNote> : null}

          <Button type="submit" loading={pending} disabled={!canSubmit}>
            {submitLabel}
          </Button>
          {!location ? (
            <p className="text-center text-xs text-muted">
              Falta fijar la ubicación en el mapa.
            </p>
          ) : null}
        </form>
      </Card>

      <Card title="Ubicación" className="lg:col-span-3">
        <form onSubmit={search} className="mb-3 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={200}
            placeholder="Buscar una dirección o lugar"
            className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2 text-sm outline-none focus:border-brand-500"
          />
          <Button
            type="submit"
            variant="secondary"
            loading={searching}
            disabled={!query.trim()}
          >
            Buscar
          </Button>
        </form>
        {searchError ? (
          <p className="mb-3 text-sm font-medium text-danger">{searchError}</p>
        ) : null}
        {locating === 'searching' ? (
          <p className="mb-3 text-sm text-muted">Buscando tu ubicación…</p>
        ) : null}
        {locating === 'failed' ? (
          <p className="mb-3 text-sm text-muted">
            No pudimos obtener tu ubicación (revisa el permiso del navegador). Usa el buscador
            para ir a un lugar.
          </p>
        ) : null}

        <LocationPicker value={location} onChange={setLocation} focus={focus} />

        <p className="mt-3 text-sm text-muted">
          {location
            ? `Ubicación: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}. Puedes arrastrar el pin para ajustarla.`
            : 'Haz clic en el mapa para colocar el pin en el lugar exacto.'}
        </p>
      </Card>
    </div>
  )
}
