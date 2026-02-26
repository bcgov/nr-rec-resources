import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, Length } from 'class-validator';
import { ConsentFormDto } from './recreation-resource-image.dto';

export class UpdateImageConsentDto extends ConsentFormDto {
  @ApiPropertyOptional({
    description: 'Display name for the image',
    example: 'Sunset at lake',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  file_name?: string;
}

export class UpdateImageConsentPatchDto {
  @ApiPropertyOptional({
    description: 'Display name for the image',
    example: 'Sunset at lake',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  file_name?: string;

  @ApiPropertyOptional({
    description: 'Date the photo was taken (ISO date string)',
    example: '2024-06-15',
  })
  @IsOptional()
  @IsDateString()
  date_taken?: string;
}
