import { ApiProperty } from '@nestjs/swagger';

export class ClientPublicFieldsDto {
  @ApiProperty({ example: '00000002', required: false })
  clientNumber?: string;

  @ApiProperty({ example: 'BAXTER', required: false })
  clientName?: string;

  @ApiProperty({ example: 'JAMES', required: false })
  legalFirstName?: string;

  @ApiProperty({ example: 'Canter', required: false })
  legalMiddleName?: string;

  @ApiProperty({ example: 'ACT', required: false })
  clientStatusCode?: string;

  @ApiProperty({ example: 'Active', required: false })
  clientStatusDescription?: string;

  @ApiProperty({ example: 'I', required: false })
  clientTypeCode?: string;

  @ApiProperty({ example: 'Individual', required: false })
  clientTypeDescription?: string;

  @ApiProperty({ example: 'JAMES BAXTER', required: false })
  acronym?: string;
}
