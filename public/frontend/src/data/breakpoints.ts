// Maps bootstrap breakpoints to view widths in pixels
export const BOOTSTRAP_BREAKPOINTS: Record<string, number> = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
};

export type BreakpointKey = keyof typeof BOOTSTRAP_BREAKPOINTS;
