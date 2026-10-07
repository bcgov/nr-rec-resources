import { ApiProperty } from '@nestjs/swagger';

export class NextRecResourceIdDto {
  @ApiProperty({
    description: 'Next available recreation resource identifier',
    example: 'REC000123',
  })
  rec_resource_id!: string;
}
