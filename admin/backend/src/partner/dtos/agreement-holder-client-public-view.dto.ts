import { ApiProperty } from '@nestjs/swagger';
import { ClientPublicViewDto } from './client-public-view.dto';

export class AgreementHolderClientPublicViewDto extends ClientPublicViewDto {
  @ApiProperty({ example: '2024-01-01', required: false })
  agreementStartDate?: string;

  @ApiProperty({ example: '2026-12-31', required: false })
  agreementEndDate?: string;

  @ApiProperty({ example: false, required: false })
  visible_on_public_website?: boolean;

  @ApiProperty({ example: 'SITE_OPERATOR', required: false })
  partner_relationship_type_code?: string;
}
