import type { MapViewProps } from "react-native-maps";

// Soft, low-contrast map. Only applies when the Google Maps provider is used.
export const mapStyle: NonNullable<MapViewProps["customMapStyle"]> = [
  { elementType: "geometry", stylers: [{ color: "#EEF2F9" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6B7A99" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#F4F7FB" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ visibility: "on" }, { color: "#DCEBE6" }],
  },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#FFFFFF" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#D7E3F5" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#C9DAF2" }],
  },
];
