import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

/**
 * Payload pushed by the Act integration to upsert an advisory.
 *
 * The composite natural key (`rec_resource_id`, `advisory_number`)
 * is used for the upsert decision:
 *  - If a row with the same key exists, the record is updated.
 *  - Otherwise a new record is created.
 *
 * All fields mirror the columns of `rst.act_advisories_flat`.
 */
export class ActAdvisoryUpsertDto {
  @ApiProperty({
    description:
      'Recreation resource identifier (REC ID) the advisory applies to.',
    example: 'REC0002',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  rec_resource_id: string;

  @ApiProperty({
    description:
      'Act advisory number. Together with rec_resource_id this forms the unique key.',
    example: 3791,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  @Min(1)
  advisory_number: number;

  @ApiProperty({
    description: 'Advisory title.',
    example: 'Bear in area',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Long-form advisory description / body.',
    example:
      'A black bear has been spotted near the main campground. Please use bear-safe storage.',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({
    description:
      'Username / identifier of the person who submitted the advisory in Act.',
    example: 'jdoe',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  submitted_by: string;

  @ApiProperty({
    description: 'Display name of the access status.',
    example: 'Open with restrictions',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  access_status_name: string;

  @ApiProperty({
    description: 'Access status grouping label.',
    example: 'Open',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  access_status_grouplabel: string;

  @ApiPropertyOptional({
    description: 'Access status description.',
    example: 'The site is open but some trails are closed.',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  access_status_description?: string | null;

  @ApiProperty({
    description: 'Event type for the advisory.',
    example: 'Wildlife',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  event_type: string;

  @ApiProperty({
    description: 'Urgency level (e.g. Low / Medium / High).',
    example: 'High',
    maxLength: 25,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  urgency: string;

  @ApiProperty({
    description: 'Advisory status (e.g. Published / Draft).',
    example: 'Published',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  advisory_status: string;

  @ApiProperty({
    description: 'Whether the advisory affects reservations.',
    example: false,
    type: Boolean,
    nullable: true,
  })
  @ValidateIf((_, value) => value !== null)
  @IsBoolean()
  is_reservations_affected: boolean | null;

  @ApiProperty({
    description: 'Whether the advisory_date should be displayed publicly.',
    example: true,
  })
  @IsBoolean()
  is_advisory_date_displayed: boolean;

  @ApiProperty({
    description: 'Whether the effective_date should be displayed publicly.',
    example: true,
  })
  @IsBoolean()
  is_effective_date_displayed: boolean;

  @ApiProperty({
    description: 'Whether the end_date should be displayed publicly.',
    example: false,
  })
  @IsBoolean()
  is_end_date_displayed: boolean;

  @ApiProperty({
    description: 'Whether the updated_date should be displayed publicly.',
    example: true,
    type: Boolean,
    nullable: true,
  })
  @ValidateIf((_, value) => value !== null)
  @IsBoolean()
  is_updated_date_displayed: boolean | null;

  @ApiProperty({
    description: 'Date the advisory was created in Act (ISO 8601).',
    example: '2026-06-01T15:00:00.000Z',
    type: String,
  })
  @Type(() => Date)
  @IsDate()
  advisory_date: Date;

  @ApiProperty({
    description: 'Date the advisory becomes effective (ISO 8601).',
    example: '2026-06-02T00:00:00.000Z',
    type: String,
  })
  @Type(() => Date)
  @IsDate()
  effective_date: Date;

  @ApiPropertyOptional({
    description: 'Date the advisory ends, if applicable (ISO 8601).',
    example: '2026-09-30T23:59:59.000Z',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @ValidateIf((_, value) => value !== null)
  @IsDate()
  end_date?: Date | null;

  @ApiPropertyOptional({
    description: 'Date the advisory expires, if applicable (ISO 8601).',
    example: '2026-10-31T23:59:59.000Z',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @ValidateIf((_, value) => value !== null)
  @IsDate()
  expiry_date?: Date | null;

  @ApiPropertyOptional({
    description: 'Date the advisory was removed in Act, if applicable.',
    example: '2026-11-15T00:00:00.000Z',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  removal_date?: Date | null;

  @ApiProperty({
    description: 'Date the advisory record was last updated in Act.',
    example: '2026-06-05T08:30:00.000Z',
    type: String,
  })
  @Type(() => Date)
  @IsDate()
  updated_date: Date;

  @ApiProperty({
    description: 'Date the advisory was last content-modified in Act.',
    example: '2026-06-05T08:30:00.000Z',
    type: String,
  })
  @Type(() => Date)
  @IsDate()
  modified_date: Date;

  @ApiPropertyOptional({
    description:
      'Deprecated alias for `published_date`. Still accepted for backward compatibility; when both fields are provided, `published_date` takes precedence.',
    example: '2026-06-02T00:00:00.000Z',
    type: String,
    nullable: true,
    deprecated: true,
  })
  @IsOptional()
  @Type(() => Date)
  @ValidateIf((_, value) => value !== null)
  @IsDate()
  published_at?: Date | null;

  @ApiPropertyOptional({
    description:
      'Date the advisory was published, if applicable. Preferred ACT field name; mapped internally to the existing `published_at` storage column.',
    example: '2026-06-02T00:00:00.000Z',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @ValidateIf((_, value) => value !== null)
  @IsDate()
  published_date?: Date | null;

  @ApiPropertyOptional({
    description: 'Listing rank used to order advisories in UIs.',
    example: 0,
  })
  @IsOptional()
  @IsInt()
  listing_rank?: number;

  @ApiPropertyOptional({
    description: 'Urgency sequence used for ordering.',
    example: 0,
  })
  @IsOptional()
  @IsInt()
  urgency_sequence?: number;

  @ApiPropertyOptional({
    description: 'Access-status precedence used for ordering.',
    example: 0,
  })
  @IsOptional()
  @IsInt()
  access_status_precedence?: number;

  @ApiPropertyOptional({
    description: 'Event-type precedence used for ordering.',
    example: 0,
  })
  @IsOptional()
  @IsInt()
  event_type_precedence?: number;
}
