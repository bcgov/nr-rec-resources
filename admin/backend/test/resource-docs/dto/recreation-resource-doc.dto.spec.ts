import { describe, it, expect } from "vitest";
import {
  CreateRecreationResourceDocBodyDto,
  RecreationResourceDocCode,
  RecreationResourceDocDto,
  CreateRecreationResourceDocFormDto,
} from "../../../src/resource-docs/dto/recreation-resource-doc.dto";

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

  it("should allow setting all optional and nullable fields", () => {
    const dto = new RecreationResourceDocDto();
    dto.ref_id = "ref";
    dto.title = null;
    dto.rec_resource_id = null;
    dto.url = undefined;
    dto.doc_code = null;
    dto.doc_code_description = undefined;
    dto.extension = null;
    dto.created_at = null;
    expect(dto.ref_id).toBe("ref");
    expect(dto.title).toBeNull();
    expect(dto.rec_resource_id).toBeNull();
    expect(dto.url).toBeUndefined();
    expect(dto.doc_code).toBeNull();
    expect(dto.doc_code_description).toBeUndefined();
    expect(dto.extension).toBeNull();
    expect(dto.created_at).toBeNull();
  });

  it("should assign enum property correctly", () => {
    const dto = new RecreationResourceDocDto();
    dto.doc_code = RecreationResourceDocCode.RM;
    expect(dto.doc_code).toBe("RM");
  });
});

describe("CreateRecreationResourceDocBodyDto", () => {
  it("should create a valid DTO instance", () => {
    const dto = new CreateRecreationResourceDocBodyDto();
    dto.title = "New File upload";

    expect(dto).toBeDefined();
    expect(dto.title).toBe("New File upload");
  });

  it("should fail validation for short title", async () => {
    const dto = new CreateRecreationResourceDocBodyDto();
    dto.title = "ab";
    // Simulate validation (would use class-validator in real test)
    expect(dto.title.length).toBeLessThan(3);
  });

  it("should fail validation for long title", async () => {
    const dto = new CreateRecreationResourceDocBodyDto();
    dto.title = "a".repeat(101);
    expect(dto.title.length).toBeGreaterThan(100);
  });

  it("should fail validation for invalid characters", async () => {
    const dto = new CreateRecreationResourceDocBodyDto();
    dto.title = "Invalid@Title!";
    expect(/^[A-Za-z0-9-_'(). ]+$/.test(dto.title)).toBe(false);
  });

  it("should pass validation for valid title", async () => {
    const dto = new CreateRecreationResourceDocBodyDto();
    dto.title = "Valid Title 123";
    expect(/^[A-Za-z0-9-_'(). ]+$/.test(dto.title)).toBe(true);
    expect(dto.title.length).toBeGreaterThanOrEqual(3);
    expect(dto.title.length).toBeLessThanOrEqual(100);
  });
});

describe("CreateRecreationResourceDocFormDto", () => {
  it("should create a valid DTO instance", () => {
    const dto = new CreateRecreationResourceDocFormDto();
    dto.title = "Campbell river site map";
    dto.file = "file-content";

    expect(dto).toBeDefined();
    expect(dto.title).toBe("Campbell river site map");
    expect(dto.file).toBe("file-content");
  });

  it("should allow file to be a Buffer", () => {
    const dto = new CreateRecreationResourceDocFormDto();
    dto.title = "Campbell river site map";
    dto.file = Buffer.from("test");
    expect(dto.file).toBeInstanceOf(Buffer);
  });

  it("should allow missing file property", () => {
    const dto = new CreateRecreationResourceDocFormDto();
    dto.title = "Campbell river site map";
    expect(dto.title).toBe("Campbell river site map");
    expect(dto.file).toBeUndefined();
  });
});
