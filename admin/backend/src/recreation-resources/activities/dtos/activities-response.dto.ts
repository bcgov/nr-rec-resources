import { RecreationActivityDto } from '@/recreation-resources/dtos/recreation-resource-detail.dto';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for activities endpoints.
 * Returns an array of recreation activities.
 */
export class ActivitiesResponseDto {
  @ApiProperty({
    description: 'List of recreational activities available at this resource',
    type: [RecreationActivityDto],
  })
  activities: RecreationActivityDto[];
}
