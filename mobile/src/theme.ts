// Same values as the colors in tailwind.config.js, for props that can't take a className
// (icon colors, map markers, map style).
export const colors = {
  brand: {
    50: "#F1F5FC",
    100: "#E3EBF8",
    200: "#CBDAF2",
    400: "#7F9FDA",
    500: "#5C82C9",
    600: "#4A6CB0",
    700: "#3B5791",
  },
  canvas: "#F4F7FB",
  ink: "#1F2A44",
  muted: "#6B7A99",
  free: "#3E9C8F",
  paid: "#C98A2B",
  danger: "#C75B5B",
  white: "#FFFFFF",
} as const;
