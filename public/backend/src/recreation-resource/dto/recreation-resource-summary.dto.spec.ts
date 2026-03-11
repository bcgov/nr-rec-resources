import { describe, it, expect } from 'vitest';
import { RecreationResourceSummaryDto } from './recreation-resource-summary.dto';

describe('RecreationResourceSummaryDto', () => {
  it('should create a valid DTO instance with all required values', () => {
    const dto = new RecreationResourceSummaryDto();
    dto.rec_resource_id = 'REC204117';
    dto.name = 'Aileen Lake';
    dto.district_code = 'RDCK';
    dto.district = 'Chilliwack';
    dto.rec_resource_type_code = 'SIT';
    dto.rec_resource_type = 'Recreation Site';
    dto.display_on_public_site = true;
    dto.status_code = 2;
    dto.status = 'Closed';
    dto.closure_comment = 'Closed due to wildfire activity in the area';
    dto.site_point_geometry =
      '{"type":"Point","coordinates":[1292239.7691,1133870.4011]}';

    expect(dto).toBeDefined();
    expect(dto.rec_resource_id).toBe('REC204117');
    expect(dto.name).toBe('Aileen Lake');
    expect(dto.district_code).toBe('RDCK');
    expect(dto.district).toBe('Chilliwack');
    expect(dto.rec_resource_type_code).toBe('SIT');
    expect(dto.rec_resource_type).toBe('Recreation Site');
    expect(dto.display_on_public_site).toBe(true);
    expect(dto.status_code).toBe(2);
    expect(dto.status).toBe('Closed');
    expect(dto.closure_comment).toBe(
      'Closed due to wildfire activity in the area',
    );
    expect(dto.site_point_geometry).toBe(
      '{"type":"Point","coordinates":[1292239.7691,1133870.4011]}',
    );
  });
});
