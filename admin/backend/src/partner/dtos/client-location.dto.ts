import { ApiProperty } from '@nestjs/swagger';
import { ClientPublicViewDto } from './client-public-view.dto';

export class ClientLocationDto extends ClientPublicViewDto {
  @ApiProperty({ example: '00', required: false })
  locationCode?: string;

  @ApiProperty({ example: 'Office', required: false })
  locationName?: string;

  @ApiProperty({ example: '01382', required: false })
  companyCode?: string;

  @ApiProperty({ example: '2080 Labieux Rd', required: false })
  address1?: string;

  @ApiProperty({ required: false })
  address2?: string;

  @ApiProperty({ required: false })
  address3?: string;

  @ApiProperty({ example: 'NANAIMO', required: false })
  city?: string;

  @ApiProperty({ example: 'BC', required: false })
  province?: string;

  @ApiProperty({ example: 'V9T6J9', required: false })
  postalCode?: string;

  @ApiProperty({ example: 'CANADA', required: false })
  country?: string;

  @ApiProperty({ example: '8006618773', required: false })
  homePhone?: string;

  @ApiProperty({ required: false })
  businessPhone?: string;

  @ApiProperty({ required: false })
  cellPhone?: string;

  @ApiProperty({ required: false })
  faxNumber?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ example: 'N', required: false })
  expired?: 'Y' | 'N';

  @ApiProperty({ example: 'N', required: false })
  trusted?: 'Y' | 'N';

  @ApiProperty({ required: false })
  returnedMailDate?: string;

  @ApiProperty({ required: false })
  comment?: string;
}
