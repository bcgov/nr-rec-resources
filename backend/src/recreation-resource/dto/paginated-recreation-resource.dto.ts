import { ApiProperty } from "@nestjs/swagger";
import { RecreationResourceDto } from "./recreation-resource.dto";

class FilterOptionDto {
  @ApiProperty({
    description: "Unique identifier for the filter option",
    example: 1,
  })
  id: number;

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

class FilterDto {
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
  @ApiProperty({ type: [RecreationResourceDto] })
  data: RecreationResourceDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty({ type: [FilterDto] })
  filters: FilterDto[];
}
