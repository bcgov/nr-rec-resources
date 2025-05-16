import {
  RecreationResourceDocCode,
  RecreationResourceDocDto,
} from "./recreation-resource-doc.dto";

describe("RecreationResourceDocDto", () => {
  it("should create a valid DTO instance", () => {
    const dto = new RecreationResourceDocDto();
    dto.ref_id = "1000";
    dto.title = "Campbell river site map";
    dto.url = "https://example.com/map.pdf";
    dto.doc_code = RecreationResourceDocCode.RM;
    dto.doc_code_description = "Recreation Map";
    dto.extension = "pdf";

    expect(dto).toBeDefined();
    expect(dto.ref_id).toBe("1000");
    expect(dto.title).toBe("Campbell river site map");
    expect(dto.url).toBe("https://example.com/map.pdf");
    expect(dto.doc_code).toBe(RecreationResourceDocCode.RM);
    expect(dto.doc_code_description).toBe("Recreation Map");
    expect(dto.extension).toBe("pdf");
  });

  it("should validate enum values", () => {
    expect(Object.values(RecreationResourceDocCode)).toContain("RM");
    expect(Object.keys(RecreationResourceDocCode)).toHaveLength(1);
  });

  it("should handle empty values", () => {
    const dto = new RecreationResourceDocDto();
    expect(dto).toBeDefined();
    expect(dto.ref_id).toBeUndefined();
    expect(dto.title).toBeUndefined();
    expect(dto.url).toBeUndefined();
    expect(dto.doc_code).toBeUndefined();
    expect(dto.doc_code_description).toBeUndefined();
    expect(dto.extension).toBeUndefined();
  });
});
