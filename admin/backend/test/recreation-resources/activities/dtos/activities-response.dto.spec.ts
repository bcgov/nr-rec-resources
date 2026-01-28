import { ActivitiesResponseDto } from '@/recreation-resources/activities/dtos/activities-response.dto';
import { RecreationActivityDto } from '@/recreation-resources/dtos/recreation-resource-detail.dto';
import { describe, expect, it } from 'vitest';

describe('ActivitiesResponseDto', () => {
  it('should have activities property', () => {
    const dto = new ActivitiesResponseDto();
    expect(dto).toHaveProperty('activities');
  });

  it('should accept valid activities array', () => {
    const mockActivities: RecreationActivityDto[] = [
      {
        recreation_activity_code: 1,
        description: 'Hiking',
      },
      {
        recreation_activity_code: 2,
        description: 'Camping',
      },
    ];

    const dto = new ActivitiesResponseDto();
    dto.activities = mockActivities;

    expect(dto.activities).toBe(mockActivities);
    expect(dto.activities).toHaveLength(2);
    expect(dto.activities[0]?.recreation_activity_code).toBe(1);
    expect(dto.activities[1]?.recreation_activity_code).toBe(2);
  });

  it('should accept empty activities array', () => {
    const dto = new ActivitiesResponseDto();
    dto.activities = [];

    expect(dto.activities).toEqual([]);
    expect(dto.activities).toHaveLength(0);
  });

  it('should maintain activities array type', () => {
    const dto = new ActivitiesResponseDto();
    const activities: RecreationActivityDto[] = [
      {
        recreation_activity_code: 3,
        description: 'Fishing',
      },
    ];

    dto.activities = activities;

    expect(Array.isArray(dto.activities)).toBe(true);
    expect(dto.activities[0]).toHaveProperty('recreation_activity_code');
    expect(dto.activities[0]).toHaveProperty('description');
  });

  it('should handle single activity', () => {
    const dto = new ActivitiesResponseDto();
    dto.activities = [
      {
        recreation_activity_code: 4,
        description: 'Swimming',
      },
    ];

    expect(dto.activities).toHaveLength(1);
    expect(dto.activities[0]?.recreation_activity_code).toBe(4);
  });
});
