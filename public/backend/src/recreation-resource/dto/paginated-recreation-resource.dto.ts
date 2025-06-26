import { ApiProperty } from "@nestjs/swagger";
import { RecreationResourceSearchDto } from "./recreation-resource.dto";

export class FilterOptionDto {
  @ApiProperty({
    description: "Unique identifier for the filter option",
    example: 1,
    type: String,
  })
  id: string;

  @ApiProperty({
    description: "Number of matching results for this filter",
    example: 42,
  })
  count: number;

  @ApiProperty({
    description: "Human-readable display text for the filter option",
    example: "Snowmobiling",
  })
  description: string;
}

export class FilterDto {
  @ApiProperty()
  type: "multi-select";

  @ApiProperty()
  label: string;

  @ApiProperty()
  param: string;

  @ApiProperty({ type: [FilterOptionDto] })
  options: FilterOptionDto[];
}

export class PaginatedRecreationResourceDto {
  @ApiProperty({ type: [RecreationResourceSearchDto] })
  data: RecreationResourceSearchDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty({ type: [FilterDto] })
  filters: FilterDto[];

  @ApiProperty({ type: [String] })
  recResourceIds: string[];

  @ApiProperty()
  extent?: string;
}
