import { ApiProperty } from "@nestjs/swagger";
import { RecreationResourceDto } from "./recreation-resource.dto";

export class PaginatedRecreationResourceDto {
  @ApiProperty({ type: [RecreationResourceDto] })
  data: RecreationResourceDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
