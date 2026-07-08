const colors = {
  light: {
    background: "#F2EBE1",
    foreground: "#0D1B36",
    card: "#FDFBFA",
    cardForeground: "#0D1B36",
    surface: "#FDFBFA",
    surfaceAlt: "#E8E1D5",
    primary: "#C49A3C",
    primaryForeground: "#FFFFFF",
    secondary: "#EAE2D6",
    secondaryForeground: "#0D1B36",
    muted: "#E0D7C8",
    mutedForeground: "#5C6B80",
    accent: "#C92A2A", // Red accent
    accentForeground: "#FFFFFF",
    border: "#D6CFC1",
    input: "#D6CFC1",
    text: "#1E293B",
    textSecondary: "#475569",
    gold: "#C49A3C",
    goldDark: "#8B6914",
    goldLight: "#E9C176",
    navyLight: "#2D4876", // Brighter blue
    navyMid: "#1A2F55",
    navyDeep: "#0D1B36",
    cream: "#F2EBE1",
    destructive: "#DC2626",
    destructiveForeground: "#ffffff",
    tint: "#0D1B36", // Use navy as tint for light mode icons where applicable, or gold
    tabBar: "#FDFBFA",
    tabBarBorder: "#D6CFC1",
    statusBar: "dark" as const,
    heroOverlay: "rgba(242,235,225,0.2)",
  },
  dark: {
    background: "#172338", // 30% lighter dark background
    foreground: "#F2EBE1",
    card: "#22334D", // Lighter card
    cardForeground: "#F2EBE1",
    surface: "#22334D",
    surfaceAlt: "#1E2D44",
    primary: "#E9C176", // Gold
    primaryForeground: "#0D1B36",
    secondary: "#2D4876", // Blue secondary
    secondaryForeground: "#F2EBE1",
    muted: "#1E2D44",
    mutedForeground: "#9CAFD1",
    accent: "#E24A4A", // Red accent
    accentForeground: "#FFFFFF",
    border: "#324B6D",
    input: "#324B6D",
    text: "#F2EBE1",
    textSecondary: "#C5D3E8",
    gold: "#E9C176",
    goldDark: "#C49A3C",
    goldLight: "#F5D89A",
    navyLight: "#324B6D",
    navyMid: "#22334D",
    navyDeep: "#172338",
    cream: "#F2EBE1",
    destructive: "#EF4444",
    destructiveForeground: "#ffffff",
    tint: "#E9C176",
    tabBar: "#172338",
    tabBarBorder: "#324B6D",
    statusBar: "light" as const,
    heroOverlay: "rgba(23,35,56,0.6)",
  },
  radius: 12,
};

export default colors;
export type ColorScheme = typeof colors.light;

