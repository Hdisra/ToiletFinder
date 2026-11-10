import type { Ionicons } from "@react-native-vector-icons/ionicons";
import type { ComponentProps } from "react";
import type { BathroomCategory } from "./types";

/** Names of the available icons. */
type IconName = ComponentProps<typeof Ionicons>["name"];

/** Each category with its Spanish name and icon. */
export const CATEGORIES: {
  value: BathroomCategory;
  label: string;
  icon: IconName;
}[] = [
  { value: "mall", label: "Centro comercial", icon: "storefront" },
  { value: "supermarket", label: "Supermercado", icon: "cart" },
  { value: "park", label: "Parque", icon: "leaf" },
  { value: "restaurant", label: "Restaurante", icon: "restaurant" },
  { value: "gas_station", label: "Gasolinera", icon: "car" },
  { value: "public", label: "Público", icon: "water" },
  { value: "other", label: "Otro", icon: "location" },
];

/** Name and icon of a category ("Otro" if unknown). */
export const categoryOf = (value: BathroomCategory) =>
  CATEGORIES.find((c) => c.value === value) ??
  CATEGORIES[CATEGORIES.length - 1];
