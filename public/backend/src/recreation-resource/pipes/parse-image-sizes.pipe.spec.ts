import { ParseImageSizesPipe } from "./parse-image-sizes.pipe";
import { RecreationResourceImageSize } from "../dto/recreation-resource-image.dto";

describe("ParseImageSizesPipe", () => {
  let pipe: ParseImageSizesPipe;
  const customDefaultSizes = [RecreationResourceImageSize.ORIGINAL];

  beforeEach(() => {
    pipe = new ParseImageSizesPipe();
  });

  describe("with default configuration", () => {
    it("should return default thumbnail when input is undefined", () => {
      expect(pipe.transform(undefined)).toEqual([
        RecreationResourceImageSize.THUMBNAIL,
      ]);
    });

    it("should return default thumbnail when input is empty string", () => {
      expect(pipe.transform("")).toEqual([
        RecreationResourceImageSize.THUMBNAIL,
      ]);
    });

    it("should handle single valid size as string", () => {
      const result = pipe.transform(RecreationResourceImageSize.ORIGINAL);
      expect(result).toEqual([RecreationResourceImageSize.ORIGINAL]);
    });

    it("should handle multiple valid sizes as comma-separated string", () => {
      const input = `${RecreationResourceImageSize.ORIGINAL},${RecreationResourceImageSize.THUMBNAIL}`;
      const expected = [
        RecreationResourceImageSize.ORIGINAL,
        RecreationResourceImageSize.THUMBNAIL,
      ];
      expect(pipe.transform(input)).toEqual(expected);
    });

    it("should handle array input", () => {
      const input = [
        RecreationResourceImageSize.ORIGINAL,
        RecreationResourceImageSize.THUMBNAIL,
      ];
      expect(pipe.transform(input)).toEqual(input);
    });

    it("should filter out invalid sizes", () => {
      const input = `${RecreationResourceImageSize.ORIGINAL},invalid,${RecreationResourceImageSize.THUMBNAIL}`;
      const expected = [
        RecreationResourceImageSize.ORIGINAL,
        RecreationResourceImageSize.THUMBNAIL,
      ];
      expect(pipe.transform(input)).toEqual(expected);
    });

    it("should return default when all sizes are invalid", () => {
      const input = "invalid1,invalid2";
      expect(pipe.transform(input)).toEqual([
        RecreationResourceImageSize.THUMBNAIL,
      ]);
    });
  });

  describe("with custom default sizes", () => {
    beforeEach(() => {
      pipe = new ParseImageSizesPipe(customDefaultSizes);
    });

    it("should use custom default sizes when input is invalid", () => {
      expect(pipe.transform(undefined)).toEqual(customDefaultSizes);
      expect(pipe.transform("")).toEqual(customDefaultSizes);
      expect(pipe.transform("invalid")).toEqual(customDefaultSizes);
    });
  });
});
