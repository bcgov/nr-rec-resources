import { ApiProperty } from '@nestjs/swagger';
import { ClientPublicViewDto } from './client-public-view.dto';

export class AgreementHolderClientPublicViewDto extends ClientPublicViewDto {
  @ApiProperty({ example: '2024-01-01', required: false })
  agreementStartDate?: string;

  @ApiProperty({ example: '2026-12-31', required: false })
  agreementEndDate?: string;
}
