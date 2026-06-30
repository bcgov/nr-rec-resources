import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * DTO used for the PUT endpoint:
 *   PUT /act/advisories/:rec_resource_id/:advisory_number
 *
 * The natural key (`rec_resource_id`, `advisory_number`) comes from the URL,
 * so it is intentionally absent from the body. All remaining fields are
 * optional to support partial updates from Act.
 */
export class ActAdvisoryUpdateDto {
  @ApiPropertyOptional({ description: 'Advisory title.', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Long-form advisory description / body.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({
    description:
      'Username / identifier of the person who submitted the advisory in Act.',
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  submitted_by?: string;

  @ApiPropertyOptional({
    description: 'Display name of the access status.',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  access_status_name?: string;

  @ApiPropertyOptional({
    description: 'Access status grouping label.',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  access_status_grouplabel?: string;

  @ApiPropertyOptional({
    description: 'Access status description.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  access_status_description?: string | null;

  @ApiPropertyOptional({
    description: 'Event type for the advisory.',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  event_type?: string;

  @ApiPropertyOptional({
    description: 'Urgency level (e.g. Low / Medium / High).',
    maxLength: 25,
  })
  @IsOptional()
  @IsString()
  @MaxLength(25)
  urgency?: string;

  @ApiPropertyOptional({
    description: 'Advisory status (e.g. Published / Draft).',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  advisory_status?: string;

  @ApiPropertyOptional({
    description: 'Whether the advisory affects reservations.',
  })
  @IsOptional()
  @IsBoolean()
  is_reservations_affected?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the advisory_date should be displayed publicly.',
  })
  @IsOptional()
  @IsBoolean()
  is_advisory_date_displayed?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the effective_date should be displayed publicly.',
  })
  @IsOptional()
  @IsBoolean()
  is_effective_date_displayed?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the end_date should be displayed publicly.',
  })
  @IsOptional()
  @IsBoolean()
  is_end_date_displayed?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the updated_date should be displayed publicly.',
  })
  @IsOptional()
  @IsBoolean()
  is_updated_date_displayed?: boolean;

  @ApiPropertyOptional({
    description: 'Date the advisory was created in Act (ISO 8601).',
    type: String,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  advisory_date?: Date;

  @ApiPropertyOptional({
    description: 'Date the advisory becomes effective (ISO 8601).',
    type: String,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  effective_date?: Date;

  @ApiPropertyOptional({
    description: 'Date the advisory ends, if applicable (ISO 8601).',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  end_date?: Date | null;

  @ApiPropertyOptional({
    description: 'Date the advisory expires, if applicable (ISO 8601).',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiry_date?: Date | null;

  @ApiPropertyOptional({
    description: 'Date the advisory was removed in Act, if applicable.',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  removal_date?: Date | null;

  @ApiPropertyOptional({
    description: 'Date the advisory record was last updated in Act.',
    type: String,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updated_date?: Date;

  @ApiPropertyOptional({
    description: 'Date the advisory was last content-modified in Act.',
    type: String,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  modified_date?: Date;

  @ApiPropertyOptional({
    description: 'Date the advisory was published, if applicable.',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  published_at?: Date | null;

  @ApiPropertyOptional({
    description: 'Listing rank used to order advisories in UIs.',
  })
  @IsOptional()
  @IsInt()
  listing_rank?: number;

  @ApiPropertyOptional({ description: 'Urgency sequence used for ordering.' })
  @IsOptional()
  @IsInt()
  urgency_sequence?: number;

  @ApiPropertyOptional({
    description: 'Access-status precedence used for ordering.',
  })
  @IsOptional()
  @IsInt()
  access_status_precedence?: number;

  @ApiPropertyOptional({
    description: 'Event-type precedence used for ordering.',
  })
  @IsOptional()
  @IsInt()
  event_type_precedence?: number;
}
