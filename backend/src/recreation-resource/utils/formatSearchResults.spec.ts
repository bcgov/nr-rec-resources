import { formatSearchResults } from "src/recreation-resource/utils/formatSearchResults";
import {
  recreationResource1Response,
  recreationResource2Response,
  recreationResource3Response,
  recreationResource4Response,
  recResourceArray,
} from "src/recreation-resource/test/mock-data.test";

describe("formatResults function", () => {
  it("should correctly format recreation_activity recreation_activity relation in the results", () => {
    const results = formatSearchResults(recResourceArray);

    expect(results[0]).toEqual(recreationResource1Response);
    expect(results[1]).toEqual(recreationResource2Response);
    expect(results[2]).toEqual(recreationResource3Response);
    expect(results[3]).toEqual(recreationResource4Response);
  });

  it("should return an empty array if no Recreation Resources are found", () => {
    const results = formatSearchResults([]);

    expect(results).toEqual([]);
  });

  it("should throw an error with garbage data", () => {
    expect(() => formatSearchResults({} as any)).toThrow(
      "recResources?.map is not a function",
    );
  });
});
