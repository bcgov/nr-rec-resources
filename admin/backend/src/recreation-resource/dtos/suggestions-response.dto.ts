import { ApiProperty } from "@nestjs/swagger";

/**
 * Represents a single recreation resource suggestion.
 */
export class SuggestionDto {
  @ApiProperty({
    description: "Name of the recreation resource",
    example: "Tamihi Creek",
  })
  name: string;

  @ApiProperty({
    description: "Unique resource ID",
    example: "REC12345",
  })
  rec_resource_id: string;

  @ApiProperty({
    description:
      "Type of recreation resource (e.g., Recreation site, Recreation trail, etc.)",
    example: "RR",
  })
  recreation_resource_type: string;

  @ApiProperty({
    description: "Resource type code (e.g., RR, IF, etc.)",
    example: "RR",
  })
  recreation_resource_type_code: string;

  @ApiProperty({
    description:
      "Description of the district (e.g., Chilliwack, Okanagan, etc.)",
    example: "Chilliwack",
  })
  district_description: string;
}

/**
 * Response DTO for recreation resource suggestions.
 */
export class SuggestionsResponseDto {
  @ApiProperty({
    description: "Total number of matching resources",
    example: 123,
  })
  total: number;

  @ApiProperty({
    type: [SuggestionDto],
    description: "List of up to 30 matching resources",
  })
  suggestions: SuggestionDto[];
}
