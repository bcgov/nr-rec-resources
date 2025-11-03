import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsIn } from 'class-validator';
import { VALID_OPTION_TYPES, type OptionType } from '../options.constants';

/**
 * Query DTO for fetching options for multiple types.
 * Accepts either repeated `types` query params or a comma-separated string.
 */
export class GetOptionsByTypesQueryDto {
  @ApiProperty({
    description: 'List of option types (array or comma-separated string)',
    example: VALID_OPTION_TYPES.slice(0, 3),
    isArray: true,
    type: String,
    enum: VALID_OPTION_TYPES,
  })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value
      : (value || '')
          .toString()
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
  )
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(VALID_OPTION_TYPES, { each: true })
  types: OptionType[];
}
