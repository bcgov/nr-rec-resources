import { ApiProperty } from '@nestjs/swagger';
import { ClientPublicViewDto } from './client-public-view.dto';

export class AgreementHolderClientPublicViewDto extends ClientPublicViewDto {
  @ApiProperty({
    example: 1000001,
    description:
      'Surrogate key of the agreement-holder row. Addresses update and delete.',
  })
  agreement_holder_id: number;

  @ApiProperty({
    type: String,
    example: '2024-01-01',
    required: false,
    nullable: true,
  })
  agreementStartDate?: string | null;

  @ApiProperty({
    type: String,
    example: '2026-12-31',
    required: false,
    nullable: true,
  })
  agreementEndDate?: string | null;

  @ApiProperty({ example: false, required: false })
  visible_on_public_website?: boolean;

  @ApiProperty({ example: 'SITE_OPERATOR', required: false })
  partner_relationship_type_code?: string;

  @ApiProperty({
    example: false,
    description:
      'Whether the agreement has been cancelled. Cancellation is one-way.',
  })
  cancelled: boolean;
}
