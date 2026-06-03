export const capitalizeWords = (str: string): string =>
  str?.toLowerCase().replace(/\b\w/g, (m: string) => m.toUpperCase());
