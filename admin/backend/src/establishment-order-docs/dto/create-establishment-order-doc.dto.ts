import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEstablishmentOrderDocBodyDto {
  @ApiProperty({
    description: 'Title of the establishment order document',
    example: 'Establishment Order 2024',
  })
  @IsString()
  @IsNotEmpty()
  title: string;
}

export class CreateEstablishmentOrderDocFormDto {
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  file: any;

  @ApiProperty({ type: 'string', required: true })
  title: string;
}
