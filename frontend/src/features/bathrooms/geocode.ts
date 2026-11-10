/** A place found by name: its coordinates and full name. */
export interface Place {
  lat: number
  lng: number
  label: string
}

/**
 * Finds a place by name with OpenStreetMap's Nominatim.
 * Its policy allows 1 request per second and no search-as-you-type, so call it
 * only when the admin submits the search. The browser sends the Referer header
 * that identifies this app.
 */
export async function searchPlace(query: string): Promise<Place | null> {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    limit: '1',
    'accept-language': 'es',
  })
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`)
  if (!res.ok) throw new Error('Place search failed')

  const [first] = (await res.json()) as {
    lat: string
    lon: string
    display_name: string
  }[]
  if (!first) return null

  // Third-party data: an invalid point would break the map, so it is treated as "not found".
  const lat = Number(first.lat)
  const lng = Number(first.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
  return { lat, lng, label: String(first.display_name) }
}
