import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { transformStringArrayQueryParam } from '../utils/transformStringArrayQueryParam';

export const ADMIN_SEARCH_SORT_VALUES = [
  'name:asc',
  'name:desc',
  'rec_resource_id:asc',
  'rec_resource_id:desc',
  'type:asc',
  'type:desc',
  'established_date:asc',
  'established_date:desc',
  'activities:asc',
  'activities:desc',
  'access:asc',
  'access:desc',
  'fee:asc',
  'fee:desc',
  'community:asc',
  'community:desc',
  'status:asc',
  'status:desc',
  'campsites:asc',
  'campsites:desc',
  'district:asc',
  'district:desc',
  'display_on_public_site:asc',
  'display_on_public_site:desc',
] as const;

export const ADMIN_SEARCH_PAGE_SIZE_VALUES = [25, 50, 100] as const;

export type AdminSearchSort = (typeof ADMIN_SEARCH_SORT_VALUES)[number];
export type AdminSearchPageSize =
  (typeof ADMIN_SEARCH_PAGE_SIZE_VALUES)[number];

export class AdminSearchQueryDto {
  @ApiPropertyOptional({
    description: 'Free-text search query',
    example: 'tamihi',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Sort field and direction',
    enum: ADMIN_SEARCH_SORT_VALUES,
    example: 'name:asc',
  })
  @IsOptional()
  @IsIn(ADMIN_SEARCH_SORT_VALUES)
  sort?: AdminSearchSort;

  @ApiPropertyOptional({
    description: '1-based page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Page size',
    enum: ADMIN_SEARCH_PAGE_SIZE_VALUES,
    example: 25,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn(ADMIN_SEARCH_PAGE_SIZE_VALUES)
  page_size?: AdminSearchPageSize;

  @ApiPropertyOptional({
    description: 'Recreation resource type codes',
    type: [String],
    example: ['SIT', 'RTR'],
  })
  @Transform(transformStringArrayQueryParam)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  type?: string[];

  @ApiPropertyOptional({
    description: 'Recreation district codes',
    type: [String],
    example: ['CHWK', 'RDCK'],
  })
  @Transform(transformStringArrayQueryParam)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  district?: string[];

  @ApiPropertyOptional({
    description: 'Recreation activity codes',
    type: [String],
    example: ['1', '22'],
  })
  @Transform(transformStringArrayQueryParam)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  activities?: string[];

  @ApiPropertyOptional({
    description: 'Access codes',
    type: [String],
    example: ['R', 'B'],
  })
  @Transform(transformStringArrayQueryParam)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  access?: string[];

  @ApiPropertyOptional({
    description: 'Closest communities',
    type: [String],
    example: ['Chilliwack', 'Whistler'],
  })
  @Transform(transformStringArrayQueryParam)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  closestCommunity?: string[];

  @ApiPropertyOptional({
    description: 'Recreation status codes',
    type: [String],
    example: ['1', '2'],
  })
  @Transform(transformStringArrayQueryParam)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  status?: string[];

  @ApiPropertyOptional({
    description: 'Project established date range start',
    example: '2020-01-01',
  })
  @IsOptional()
  @IsDateString()
  establishment_date_from?: string;

  @ApiPropertyOptional({
    description: 'Project established date range end',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  establishment_date_to?: string;
}
