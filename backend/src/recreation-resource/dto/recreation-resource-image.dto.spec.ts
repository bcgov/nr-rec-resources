import { describe, expect, it } from "vitest";
import {
  RecreationResourceImageSize,
  RecreationResourceImageVariantDto,
} from "./recreation-resource-image.dto";

describe("RecreationResourceImageVariantDto", () => {
  it("should create an instance with valid properties", () => {
    const dto = new RecreationResourceImageVariantDto();
    dto.size_code = RecreationResourceImageSize.ORIGINAL;
    dto.url = "https://example.com/image.jpg";
    dto.width = 1920;
    dto.height = 1080;
    dto.extension = "jpg";

    expect(dto).toBeInstanceOf(RecreationResourceImageVariantDto);
    expect(dto.size_code).toBe("original");
    expect(dto.url).toBe("https://example.com/image.jpg");
    expect(dto.width).toBe(1920);
    expect(dto.height).toBe(1080);
    expect(dto.extension).toBe("jpg");
  });

  it("should accept valid image dimensions", () => {
    const dto = new RecreationResourceImageVariantDto();

    expect(() => {
      Object.assign(dto, {
        size_code: RecreationResourceImageSize.ORIGINAL,
        url: "https://example.com/image.jpg",
        width: 800,
        height: 600,
        extension: "png",
      });
    }).not.toThrow();
  });
});
