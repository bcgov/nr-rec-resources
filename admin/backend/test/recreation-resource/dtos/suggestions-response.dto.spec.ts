import { describe, expect, it } from "vitest";
import {
  SuggestionDto,
  SuggestionsResponseDto,
} from "@/recreation-resource/dtos/suggestions-response.dto";

describe("SuggestionsResponseDto", () => {
  it("should create a valid SuggestionsResponseDto with data using constructors", () => {
    const suggestion = new SuggestionDto();
    suggestion.name = "Test Resource";
    suggestion.rec_resource_id = "REC123";
    suggestion.recreation_resource_type = "RR";
    suggestion.recreation_resource_type_code = "RR";

    const response = new SuggestionsResponseDto();
    response.total = 1;
    response.data = [suggestion];

    expect(response.total).toBe(1);
    expect(response.data.length).toBe(1);
    expect(response.data[0].name).toBe("Test Resource");
    expect(response.data[0].rec_resource_id).toBe("REC123");
    expect(response.data[0].recreation_resource_type).toBe("RR");
    expect(response.data[0].recreation_resource_type_code).toBe("RR");
  });

  it("should allow an empty data array using constructors", () => {
    const response = new SuggestionsResponseDto();
    response.total = 0;
    response.data = [];

    expect(response.total).toBe(0);
    expect(response.data).toEqual([]);
  });
});
