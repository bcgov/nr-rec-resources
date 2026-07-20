import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsString,
  MaxLength,
} from 'class-validator';
import { ActAdvisoryUpsertDto } from './act-advisory-upsert.dto';

/**
 * Bulk upsert payload for applying the same advisory to multiple recreation
 * resources without sending duplicate requests.
 *
 * This is the chosen bulk-ID optimization for the Act integration: the caller
 * sends one advisory payload plus a `rec_resource_ids` array, and the backend
 * fans that out to one row per `(rec_resource_id, advisory_number)`.
 */
export class ActAdvisoryBulkUpsertDto extends OmitType(ActAdvisoryUpsertDto, [
  'rec_resource_id',
] as const) {
  @ApiProperty({
    description:
      'Recreation resource identifiers (REC IDs) the advisory applies to. The same advisory payload is upserted once per resource ID.',
    example: ['REC0002', 'REC0042'],
    type: [String],
    minItems: 1,
    uniqueItems: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(20, { each: true })
  rec_resource_ids: string[];
}
