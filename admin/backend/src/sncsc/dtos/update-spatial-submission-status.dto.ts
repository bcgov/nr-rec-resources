import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { SNCSC_STATUS_RESOURCE_TYPE } from '../sncsc.constants';

export class UpdateSpatialSubmissionStatusDto {
  @ApiProperty({
    name: '@type',
    description: 'SNCSC resource type discriminator.',
    example: SNCSC_STATUS_RESOURCE_TYPE,
  })
  @IsString()
  @IsIn([SNCSC_STATUS_RESOURCE_TYPE])
  '@type': string;

  @ApiProperty({
    description: 'Submission status sent by SNCSC.',
    enum: ['CLR', 'APP', 'REJ'],
    example: 'APP',
  })
  @IsString()
  @IsIn(['CLR', 'APP', 'REJ'])
  status: 'CLR' | 'APP' | 'REJ';

  @ApiProperty({
    description: 'Decision/clearance time as epoch milliseconds.',
    example: 1791436445000,
  })
  @IsInt()
  @Min(0)
  statusDate: number;

  @ApiProperty({
    description:
      "Adjudicator's free-text decision note. Null on CLR; on APP/REJ send null when blank.",
    nullable: true,
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  comment?: string | null;

  @ApiProperty({
    description:
      'Document-management URI of the adjudication report. Required for APP; optional for REJ; null for CLR.',
    nullable: true,
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  adjudicationReportDocumentUri?: string | null;

  @ApiProperty({
    description: 'SNCSC user who made the decision.',
    example: 'SNCSC_USER_01',
  })
  @IsString()
  @MaxLength(30)
  userId: string;
}
