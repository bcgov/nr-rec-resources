import { ApiProperty } from '@nestjs/swagger';
import { OptionDto } from '../dtos/option.dto';
import { VALID_OPTION_TYPES } from '../options.constants';
import { type OptionType } from '../options.types';

export class OptionsByTypeDto {
  @ApiProperty({
    description: 'Option type',
    example: VALID_OPTION_TYPES[0],
    enum: VALID_OPTION_TYPES,
  })
  type: OptionType;

  @ApiProperty({
    description: 'Options for the provided type',
    type: [OptionDto],
  })
  options: OptionDto[];
}
