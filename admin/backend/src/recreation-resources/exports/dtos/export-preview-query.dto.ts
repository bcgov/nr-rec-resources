import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ExportQueryDto } from './export-query.dto';

const DEFAULT_EXPORT_PREVIEW_LIMIT = 50;
const MAX_EXPORT_PREVIEW_LIMIT = 100;

export class ExportPreviewQueryDto extends ExportQueryDto {
  @ApiPropertyOptional({
    description: 'Preview row limit',
    default: DEFAULT_EXPORT_PREVIEW_LIMIT,
    minimum: 1,
    maximum: MAX_EXPORT_PREVIEW_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_EXPORT_PREVIEW_LIMIT)
  limit: number = DEFAULT_EXPORT_PREVIEW_LIMIT;
}
