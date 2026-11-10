/** Values the API accepts for the type of place. */
export type BathroomCategory =
  | 'mall'
  | 'supermarket'
  | 'park'
  | 'restaurant'
  | 'gas_station'
  | 'public'
  | 'other'

/** Each category with the Spanish name shown in the app. */
export const CATEGORIES: { value: BathroomCategory; label: string }[] = [
  { value: 'mall', label: 'Centro comercial' },
  { value: 'supermarket', label: 'Supermercado' },
  { value: 'park', label: 'Parque' },
  { value: 'restaurant', label: 'Restaurante' },
  { value: 'gas_station', label: 'Gasolinera' },
  { value: 'public', label: 'Público' },
  { value: 'other', label: 'Otro' },
]

/** Spanish name of a category (the raw value if unknown). */
export const categoryLabel = (value: string) =>
  CATEGORIES.find((c) => c.value === value)?.label ?? value
