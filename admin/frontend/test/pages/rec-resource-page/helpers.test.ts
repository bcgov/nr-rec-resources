import { formatDocumentDate } from "@/pages/rec-resource-page/helpers";

describe("formatDocumentDate", () => {
  it("formats ISO date string to en-CA format", () => {
    // 2023-07-13T15:30:00Z UTC
    const result = formatDocumentDate("2023-07-13T15:30:00Z");
    // The output will depend on the local timezone, so just check for expected substrings
    expect(result).toMatch(/Jul/);
    expect(result).toMatch(/2023/);
    expect(result).toMatch(/\d{2}/); // day
    expect(result).toMatch(/\d{2}:\d{2}/); // time
  });

  it("handles invalid date string gracefully", () => {
    const result = formatDocumentDate("not-a-date");
    expect(result).toBe("Invalid Date");
  });
});
