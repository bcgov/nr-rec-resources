/**
 * Formats the date string for display.
 */
export function formatDocumentDate(date: string): string {
  return new Date(date).toLocaleString("en-CA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
