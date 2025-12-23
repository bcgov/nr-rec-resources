import { RecreationFeatureDto } from '@/recreation-resources/features/dtos/recreation-feature.dto';
import { describe, expect, it } from 'vitest';

describe('RecreationFeatureDto', () => {
  it('should create an instance', () => {
    const dto = new RecreationFeatureDto();
    expect(dto).toBeInstanceOf(RecreationFeatureDto);
  });

  it('should assign properties', () => {
    const dto = new RecreationFeatureDto();
    dto.recreation_feature_code = 'A1';
    dto.description = 'Sport Fish';

    expect(dto.recreation_feature_code).toBe('A1');
    expect(dto.description).toBe('Sport Fish');
  });
});
