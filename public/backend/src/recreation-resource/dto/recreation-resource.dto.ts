import { ApiProperty } from '@nestjs/swagger';
import { RecreationResourceImageDto } from './recreation-resource-image.dto';
import { RecreationResourceDocDto } from './recreation-resource-doc.dto';
import { ClientPublicViewDto } from 'src/service/fsa-resources';
import { ArrayMaxSize, ArrayMinSize } from '@nestjs/class-validator';

export enum RecreationResourceMaintenanceStandardCode {
  U = 'U', // User maintained
  M = 'M', // Maintained
}

export enum TrailType {
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  BLACK = 'BLACK',
}

export class RecreationActivityTrailDto {
  @ApiProperty({
    description:
      'Type of trail activity represented by code (BLUE, GREEN, BLACK)',
    enum: TrailType,
    example: 'BLUE',
  })
  trail_type: TrailType;

  @ApiProperty({
    description: 'Name of the trail',
    example: 'Blue Ridge Trail',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the trail',
    example: 'A beginner-friendly trail with gentle slopes and scenic views',
  })
  description: string;
}

export class RecreationActivityDto {
  @ApiProperty({
    description: 'Unique code identifying the recreation activity',
    example: 'HIKING',
  })
  recreation_activity_code: number;

  @ApiProperty({
    description: 'Description of the activity',
    example: 'Hiking trails available for all skill levels',
  })
  description: string;

  @ApiProperty({
    description:
      'Detailed description of the activity including any accessibility information',
    example: 'Accessible hiking trails with gentle slopes and clear signage',
  })
  details: string;

  @ApiProperty({
    description: 'Indicates if the activity is accessible',
    example: true,
  })
  is_accessible: boolean;

  @ApiProperty({
    description:
      'List of trails associated with the recreation activity (if applicable)',
    example: [
      {
        trail_type: 'BLUE',
        name: 'Blue Ridge Trail',
        description:
          'A beginner-friendly trail with gentle slopes and scenic views',
      },
    ],
    required: false,
  })
  recreation_activity_trails?: RecreationActivityTrailDto[];
}

export class RecreationFeeDto {
  @ApiProperty({
    description: 'Amount charged for the recreation resource',
    example: 15,
  })
  fee_amount: number;

  @ApiProperty({
    description: 'Start date for the fee applicability',
    example: '2024-06-01',
  })
  fee_start_date: Date;

  @ApiProperty({
    description: 'End date for the fee applicability',
    example: '2024-09-30',
  })
  fee_end_date: Date;

  @ApiProperty({
    description: 'Type of fee applicable represented by code (C, D, H, P, T)',
    example: 'C',
  })
  recreation_fee_code: string;

  @ApiProperty({
    description: 'Recurring start date in MMDD format (month-day)',
    example: '06-15',
    required: false,
  })
  recurring_start_mmdd?: string;

  @ApiProperty({
    description: 'Recurring end date in MMDD format (month-day)',
    example: '08-31',
    required: false,
  })
  recurring_end_mmdd?: string;

  @ApiProperty({
    description: 'Indicates if the fee is recurring annually',
    example: true,
  })
  recurring_ind: boolean;

  @ApiProperty({
    description: 'Indicates if the fee applies on Monday',
    example: 'Y',
  })
  monday_ind: string;

  @ApiProperty({
    description: 'Indicates if the fee applies on Tuesday',
    example: 'Y',
  })
  tuesday_ind: string;

  @ApiProperty({
    description: 'Indicates if the fee applies on Wednesday',
    example: 'Y',
  })
  wednesday_ind: string;

  @ApiProperty({
    description: 'Indicates if the fee applies on Thursday',
    example: 'Y',
  })
  thursday_ind: string;

  @ApiProperty({
    description: 'Indicates if the fee applies on Friday',
    example: 'Y',
  })
  friday_ind: string;

  @ApiProperty({
    description: 'Indicates if the fee applies on Saturday',
    example: 'Y',
  })
  saturday_ind: string;

  @ApiProperty({
    description: 'Indicates if the fee applies on Sunday',
    example: 'Y',
  })
  sunday_ind: string;
}

export class RecreationStatusDto {
  @ApiProperty({
    description: 'Status code of the resource',
  })
  status_code: number;

  @ApiProperty({
    description: 'Additional status information',
    example: 'Temporary closure due to weather conditions',
    nullable: true,
  })
  comment: string;

  @ApiProperty({
    description: 'Detailed status description',
    example: 'The facility is currently closed to visitors',
  })
  description: string;
}

export class RecreationStructureDto {
  @ApiProperty({
    description: 'Indicates if the recreation resource has at least one toilet',
    example: false,
  })
  has_toilet: boolean;

  @ApiProperty({
    description: 'Indicates if the recreation resource has at least one table',
    example: false,
  })
  has_table: boolean;
}

export class RecreationResourceDistrictDto {
  @ApiProperty({
    description: 'Unique identifier for the recreation district',
    example: 'RDCK',
  })
  district_code: string;

  @ApiProperty({
    description: 'Name of the recreation district',
    example: 'Chilliwack',
  })
  description: string;
}

export class RecreationResourceReservationInfoDto {
  @ApiProperty({
    description: 'Reservation website of designed resource',
    example: 'www.firesidecamping.ca',
    required: false,
  })
  reservation_website?: string;
  @ApiProperty({
    description: 'Reservation phone number of designed resource',
    example: '(999)999-9999',
    required: false,
  })
  reservation_phone_number?: string;
  @ApiProperty({
    description: 'Reservation email of designed resource',
    example: 'reservation@email.com',
    required: false,
  })
  reservation_email?: string;
  reservation_instructions: string;
  reservation_comments: string;
}

export class AdvisoryDto {
  @ApiProperty({
    description: 'Unique identifier for the advisory',
    example: 12345,
  })
  advisory_number: number;

  @ApiProperty({
    description: 'Title of the advisory',
    example: 'Seasonal wildlife migration activity in area',
  })
  title: string;

  @ApiProperty({
    description: 'Description of the advisory',
    example: 'A permit is required to access this ecological reserve',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description:
      'Name of the person or organization that submitted the advisory',
    example: 'John Doe, Park Ranger',
  })
  submitted_by: string;

  @ApiProperty({
    description: 'Access status group label for the advisory',
    example: 'Information',
  })
  access_status_grouplabel: string;

  @ApiProperty({
    description: 'Access status name for the advisory',
    example: 'Information',
  })
  access_status_name: string;

  @ApiProperty({
    description: 'Description of the access status for the advisory',
    example: 'General park notice or update.',
  })
  access_status_description?: string;

  @ApiProperty({
    description: 'Event type of the advisory',
    example: 'Fire Management',
  })
  event_type: string;

  @ApiProperty({
    description: 'Urgency level of the advisory',
    example: 'Low',
  })
  urgency: string;

  @ApiProperty({
    description: 'Publication status of the advisory',
    example: 'Published',
  })
  advisory_status: string;

  @ApiProperty({
    description: 'Indicates if the advisory affects reservations',
    example: false,
  })
  is_reservations_affected: boolean;

  @ApiProperty({
    description: 'Indicates if the advisory date should be displayed',
    example: false,
  })
  is_advisory_date_displayed: boolean;

  @ApiProperty({
    description: 'Indicates if the effective date should be displayed',
    example: false,
  })
  is_effective_date_displayed: boolean;

  @ApiProperty({
    description: 'Indicates if the end date should be displayed',
    example: false,
  })
  is_end_date_displayed: boolean;

  @ApiProperty({
    description: 'Indicates if the updated date should be displayed',
    example: false,
  })
  is_updated_date_displayed: boolean;

  @ApiProperty({
    description: 'Date and time when the advisory was created',
    example: '2024-06-01T12:00:00Z',
    required: false,
  })
  advisory_date: Date;

  @ApiProperty({
    description: 'Date and time when the advisory becomes effective',
    example: '2024-06-01T12:00:00Z',
    required: false,
  })
  effective_date: Date;

  @ApiProperty({
    description: 'Date and time when the advisory ends',
    example: '2024-09-30T23:59:00Z',
    required: false,
  })
  end_date?: Date;

  @ApiProperty({
    description: 'Date and time when the advisory is to be removed',
    example: '2024-12-31T23:59:00Z',
    required: false,
  })
  removal_date?: Date;

  @ApiProperty({
    description: 'Date and time when the advisory was last modified',
    example: '2024-06-15T15:30:00Z',
    required: false,
  })
  modified_date: Date;

  @ApiProperty({
    description: 'Date and time when the advisory was published',
    example: '2024-06-01T12:00:00Z',
    required: false,
  })
  published_at?: Date;

  @ApiProperty({
    description: 'Date and time when the advisory was last updated',
    example: '2024-06-15T15:30:00Z',
    required: false,
  })
  updated_date?: Date;

  @ApiProperty({
    description: 'Date and time when the advisory will expire',
    example: '2024-09-30T23:59:00Z',
    required: false,
  })
  expiry_date?: Date;

  @ApiProperty({
    description:
      'Rank for ordering advisories in listings, calculated based on urgency, access status, and event type to ensure the most critical advisories are displayed prominently.',
    example: '50',
  })
  listing_rank: number;

  @ApiProperty({
    description:
      'Sequence number for the urgency level associated with the advisory.',
    example: '1',
  })
  urgency_sequence: number;

  @ApiProperty({
    description:
      'Precedence value for the access status associated with the advisory.',
    example: '2',
  })
  access_status_precedence: number;

  @ApiProperty({
    description:
      'Precedence value for the event type associated with the advisory.',
    example: '3',
  })
  event_type_precedence: number;
}

/**
 * Base class containing common fields/properties for recreation resources
 * @abstract
 */
export abstract class BaseRecreationResourceDto {
  @ApiProperty({
    description: 'Unique identifier of the Recreation Resource',
    example: 'rec-123-abc',
    format: 'uuid',
  })
  rec_resource_id: string;

  @ApiProperty({
    description: 'Official name of the Recreation Resource',
    example: 'Evergreen Valley Campground',
    minLength: 1,
    maxLength: 100,
  })
  name: string;

  @ApiProperty({
    description: 'Physical location of the Recreation Resource',
    example: '123 Forest Road, Mountain View, CA 94043',
  })
  closest_community: string;

  @ApiProperty({
    description: 'List of recreational activities available at this resource',
    type: [RecreationActivityDto],
  })
  recreation_activity: RecreationActivityDto[];

  @ApiProperty({
    description:
      'List of accessible recreational activities available at this resource',
    type: [RecreationActivityDto],
    required: false,
  })
  accessible_recreation_activity?: RecreationActivityDto[];

  @ApiProperty({
    description: 'Current operational status of the Recreation Resource',
    type: RecreationStatusDto,
  })
  recreation_status: RecreationStatusDto;

  @ApiProperty({
    description:
      'Code representing a specific feature associated with the recreation resource',
    example: 'IF',
  })
  rec_resource_type: string;

  @ApiProperty({
    description: 'List of images for the recreation resource',
    type: [RecreationResourceImageDto],
    required: false,
  })
  recreation_resource_images?: RecreationResourceImageDto[];
}

/**
 * Complete DTO including spatial data - used for detailed resource retrieval
 */
export class RecreationResourceDetailDto extends BaseRecreationResourceDto {
  @ApiProperty({
    description: 'Detailed description of the Recreation Resource',
    example: 'A scenic campground nestled in the heart of Evergreen Valley',
  })
  description?: string;

  @ApiProperty({
    description: 'Driving directions to the Recreation Resource',
    example: 'Take exit 123 off the highway and follow the signs',
  })
  driving_directions?: string;

  @ApiProperty({
    description: 'The maintenance standard code for the recreation resource',
    enum: RecreationResourceMaintenanceStandardCode,
    example: RecreationResourceMaintenanceStandardCode.U,
  })
  maintenance_standard_code?: RecreationResourceMaintenanceStandardCode;

  @ApiProperty({
    description:
      'Number of campsites available in the recreation site or trail',
    example: 15,
    minimum: 0,
  })
  campsite_count: number;

  @ApiProperty({
    description:
      "List of fee details for the recreation resource (supports multiple fees with code 'C')",
    type: [RecreationFeeDto],
  })
  recreation_fee: RecreationFeeDto[];

  @ApiProperty({
    description: 'Recreation Access Types',
    example: ['Road', 'Boat-in'],
    type: [String],
  })
  recreation_access: string[];

  @ApiProperty({
    description:
      "List of additional fees that do not fall under the main recreation fee category (non-'C' codes)",
    type: [RecreationFeeDto],
  })
  additional_fees: RecreationFeeDto[];

  @ApiProperty({
    description:
      'Structure-related facilities available at the recreation resource (e.g., toilets, tables)',
    type: RecreationStructureDto,
  })
  recreation_structure: RecreationStructureDto;

  @ApiProperty({
    description: 'GeoJSON geometry data for the rec resource in string format',
    type: [String],
    required: false,
    example: [
      '{"type":"MultiPolygon","coordinates":[[[[1361161.693,527454.011],[1361142.12,527451.215],[1361124.878,527449.351],[1361107.636,527447.021],[1361091.326,527449.351],[1361073.152,527452.613], ...]]]}',
    ],
  })
  spatial_feature_geometry?: string[];

  @ApiProperty({
    description:
      'GeoJSON geometry data for the point location for the rec resource in string format',
    type: String,
    required: false,
    example: ['{"type":"Point","coordinates":[1292239.7691,1133870.4011]}'],
  })
  site_point_geometry?: string;

  @ApiProperty({
    description: 'List of documents for the recreation resource',
    type: [RecreationResourceDocDto],
    required: false,
  })
  recreation_resource_docs?: RecreationResourceDocDto[];

  @ApiProperty({
    description: 'Recreation district',
    type: RecreationResourceDistrictDto,
    required: false,
  })
  recreation_district?: RecreationResourceDistrictDto;

  @ApiProperty({
    description: 'Recreation resource reservation info',
    type: RecreationResourceReservationInfoDto,
    required: false,
  })
  recreation_resource_reservation_info?: RecreationResourceReservationInfoDto;

  @ApiProperty({
    description: 'Recreation resource reservation info',
    type: [AdvisoryDto],
    required: false,
  })
  advisories?: AdvisoryDto[];
}

/**
 * Limited DTO without spatial data - optimized for search operations
 */
export class RecreationResourceSearchDto extends BaseRecreationResourceDto {}

/**
 * Base class containing common fields/properties for site operator
 * @abstract
 */
export class SiteOperatorDto implements ClientPublicViewDto {
  @ApiProperty({
    description: 'Unique identifier of the Site Operator',
    example: '00000002',
  })
  clientNumber?: string;

  @ApiProperty({
    description: 'Client Name',
    example: 'BAXTER',
  })
  clientName?: string;

  @ApiProperty({
    description: 'Client Legal First Name',
    example: 'JAMES',
  })
  legalFirstName?: string;

  @ApiProperty({
    description: 'Client Legal Middle Name',
    example: 'JAMES',
  })
  legalMiddleName?: string;

  @ApiProperty({
    description: 'Client Status Code',
    example: 'ACT',
  })
  clientStatusCode?: string;

  @ApiProperty({
    description: 'Client Type Code',
    example: 'I',
  })
  clientTypeCode?: string;

  @ApiProperty({
    description: 'Client Acronym',
    example: 'JAMES BAXTER',
  })
  acronym?: string;
}

export class RecResourcesIdsDto {
  @ApiProperty({
    description: 'Array of Rec Resources Ids',
    example: '["REC230522","REC230523"]',
  })
  @ArrayMinSize(1)
  @ArrayMaxSize(400)
  ids: string[];
}
