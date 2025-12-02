import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpdateRecreationAccessCodeDto {
  @ApiProperty({
    description: 'Access code (stored in recreation_access table)',
    example: 'R',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  access_code: string;

  @ApiPropertyOptional({
    description: 'Sub access codes related to this access code',
    example: ['4W'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sub_access_codes?: string[];
}

/**
 * DTO for updating recreation resource.
 * Handles both direct fields on recreation_resource table
 * and related fields in separate tables.
 *
 * All fields are optional (partial update semantics).
 * Validation is handled by class-validator decorators - the service layer
 * does not need additional validation logic.
 *
 * Note: An empty update body is technically valid and will return the
 * current resource state unchanged (idempotent behavior).
 */
export class UpdateRecreationResourceDto {
  @ApiPropertyOptional({
    description: 'Maintenance standard code',
    example: 'M',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  maintenance_standard_code?: string;

  @ApiPropertyOptional({
    description:
      'Control access code (stored in recreation_control_access_code table)',
    example: 'G',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  control_access_code?: string | null;

  @ApiPropertyOptional({
    description: 'Risk rating code',
    example: 'H',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  risk_rating_code?: string | null;

  @ApiPropertyOptional({
    description: 'Project established date',
    example: '2024-01-15',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  project_established_date?: Date | null;

  @ApiPropertyOptional({
    description: 'List of access codes with their sub-access codes',
    type: [UpdateRecreationAccessCodeDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateRecreationAccessCodeDto)
  @IsOptional()
  access_codes?: UpdateRecreationAccessCodeDto[];

  @ApiPropertyOptional({
    description: 'Status code (open or closed)',
    example: 1, // 1 = Open, 2 = Closed
  })
  @IsOptional()
  @IsNumber()
  status_code?: number;

  @ApiPropertyOptional({
    description: 'District code (recreation district)',
    example: 'CHWK',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  district_code?: string;

  @ApiPropertyOptional({
    description:
      'Indicates if the resource should be displayed on the public site',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  display_on_public_site?: boolean;
}
