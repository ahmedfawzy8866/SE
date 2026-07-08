import { useWindowDimensions } from "react-native";

export type Breakpoint = "mobile" | "tablet" | "desktop";

export function useBreakpoint() {
  const { width } = useWindowDimensions();

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1200;
  const isDesktop = width >= 1200;

  const breakpoint: Breakpoint = isDesktop ? "desktop" : isTablet ? "tablet" : "mobile";

  /** Number of property grid columns */
  const numColumns = isDesktop ? 3 : isTablet ? 2 : 1;

  /** Max content width on desktop (keeps text readable) */
  const contentMaxWidth = isDesktop ? 1280 : isTablet ? 900 : "100%";

  return { width, isMobile, isTablet, isDesktop, breakpoint, numColumns, contentMaxWidth };
}
