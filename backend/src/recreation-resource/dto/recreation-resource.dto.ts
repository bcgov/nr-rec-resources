import { ApiProperty } from "@nestjs/swagger";

export class RecreationResourceDto {
  @ApiProperty({
    description: "The ID of the Recreation Resource",
    // default: 'REC1234',
  })
  forest_file_id: string;

  @ApiProperty({
    description: "The name of the Recreation Resource",
    // default: 'Rec Site',
  })
  name: string;

  @ApiProperty({
    description: "The description of the Recreation Resource",
    default: "",
  })
  description: string;
}
