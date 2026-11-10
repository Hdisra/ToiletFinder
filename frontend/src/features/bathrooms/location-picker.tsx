import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'

/** A point on the map. */
export interface LatLng {
  lat: number
  lng: number
}

/** Blue pin shown on the map (drawn with CSS, class `map-pin`). */
const PIN = L.divIcon({
  className: '',
  html: '<div class="map-pin"></div>',
  iconSize: [28, 28],
  iconAnchor: [4, 32],
})

/**
 * Map where the admin places a bathroom: click it or drag the pin.
 * Tiles come from OpenStreetMap (free, no API key); the attribution is required by its terms.
 * `focus` moves the map (a new object each time, e.g. after a search).
 */
export function LocationPicker({
  value,
  onChange,
  focus,
}: {
  value: LatLng | null
  onChange: (value: LatLng) => void
  focus: LatLng | null
}) {
  // Refs: the map's <div>, the Leaflet map, the pin, and the latest `onChange` (so map events never use a stale one).
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  })

  // Create the map once.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const map = L.map(container, { center: [20, 0], zoom: 2 })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)
    // The map repeats horizontally: wrap() brings a click on a repeated copy back to -180..180, the range the API accepts.
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng.wrap()
      onChangeRef.current({ lat, lng })
    })
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [])

  // Keep the pin in sync with the selected location.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (!value) {
      markerRef.current?.remove()
      markerRef.current = null
      return
    }
    if (!markerRef.current) {
      const marker = L.marker(value, { icon: PIN, draggable: true }).addTo(map)
      marker.on('dragend', () => {
        const { lat, lng } = marker.getLatLng().wrap()
        onChangeRef.current({ lat, lng })
      })
      markerRef.current = marker
    } else {
      markerRef.current.setLatLng(value)
    }
  }, [value])

  // Move the map when asked to.
  useEffect(() => {
    if (focus) mapRef.current?.flyTo(focus, 17)
  }, [focus])

  return <div ref={containerRef} className="h-96 w-full rounded-xl lg:h-[28rem]" />
}
