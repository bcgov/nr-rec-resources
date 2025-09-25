import {
  RecreationAccessDto,
  RecreationActivityDto,
  RecreationFeeDto,
  RecreationResourceDetailDto,
  RecreationResourceDistrictDto,
  RecreationResourceMaintenanceStandardCode,
  RecreationStatusDto,
  RecreationStructureDto,
} from '@/recreation-resource/dtos/recreation-resource-detail.dto';
import { describe, expect, it } from 'vitest';

describe('RecreationResourceDetailDto', () => {
  it('should create an instance', () => {
    const dto = new RecreationResourceDetailDto();
    expect(dto).toBeInstanceOf(RecreationResourceDetailDto);
  });

  it('should assign all properties correctly', () => {
    const dto = new RecreationResourceDetailDto();
    dto.rec_resource_id = 'rec-123-abc';
    dto.name = 'Evergreen Valley Campground';
    dto.closest_community = 'Mountain View';
    dto.recreation_activity = [];
    dto.recreation_status = {
      status_code: 1,
      comment: 'Open',
      description: 'Open',
    };
    dto.rec_resource_type = 'IF';
    dto.description = 'A scenic campground';
    dto.driving_directions = 'Take exit 123';
    dto.maintenance_standard_code = RecreationResourceMaintenanceStandardCode.U;
    dto.campsite_count = 10;

    const recreationAccessDto = new RecreationAccessDto();
    recreationAccessDto.access_code = 'R';
    recreationAccessDto.description = 'Road';
    recreationAccessDto.sub_access_code = '4W';
    recreationAccessDto.sub_access_description = '4 wheel drive';
    dto.recreation_access = [recreationAccessDto];

    dto.recreation_structure = { has_toilet: true, has_table: false };
    dto.spatial_feature_geometry = ['geojson1', 'geojson2'];
    dto.site_point_geometry = '{"type":"Point","coordinates":[1,2]}';
    dto.recreation_district = {
      district_code: 'RDCK',
      description: 'Chilliwack',
    };

    expect(dto.rec_resource_id).toBe('rec-123-abc');
    expect(dto.name).toBe('Evergreen Valley Campground');
    expect(dto.closest_community).toBe('Mountain View');
    expect(dto.recreation_activity).toEqual([]);
    expect(dto.recreation_status.status_code).toBe(1);
    expect(dto.rec_resource_type).toBe('IF');
    expect(dto.description).toBe('A scenic campground');
    expect(dto.driving_directions).toBe('Take exit 123');
    expect(dto.maintenance_standard_code).toBe(
      RecreationResourceMaintenanceStandardCode.U,
    );
    expect(dto.campsite_count).toBe(10);
    expect(dto.recreation_access).toEqual([recreationAccessDto]);
    expect(dto.recreation_structure.has_toilet).toBe(true);
    expect(dto.recreation_structure.has_table).toBe(false);
    expect(dto.spatial_feature_geometry).toEqual(['geojson1', 'geojson2']);
    expect(dto.site_point_geometry).toBe(
      '{"type":"Point","coordinates":[1,2]}',
    );
    expect(dto.recreation_district.district_code).toBe('RDCK');
    expect(dto.recreation_district.description).toBe('Chilliwack');
  });

  it('should allow undefined optional properties', () => {
    const dto = new RecreationResourceDetailDto();
    expect(dto.description).toBeUndefined();
    expect(dto.driving_directions).toBeUndefined();
    expect(dto.maintenance_standard_code).toBeUndefined();
    expect(dto.spatial_feature_geometry).toBeUndefined();
    expect(dto.site_point_geometry).toBeUndefined();
    expect(dto.recreation_district).toBeUndefined();
  });

  it('should assign and use all enums', () => {
    const dto = new RecreationResourceDetailDto();
    dto.maintenance_standard_code = RecreationResourceMaintenanceStandardCode.M;
    expect(dto.maintenance_standard_code).toBe(
      RecreationResourceMaintenanceStandardCode.M,
    );
  });
});

describe('RecreationActivityDto', () => {
  it('should assign properties', () => {
    const dto = new RecreationActivityDto();
    dto.recreation_activity_code = 1;
    dto.description = 'Hiking';
    expect(dto.recreation_activity_code).toBe(1);
    expect(dto.description).toBe('Hiking');
  });
});

describe('RecreationFeeDto', () => {
  it('should assign properties', () => {
    const dto = new RecreationFeeDto();
    dto.fee_amount = 15;
    dto.fee_start_date = new Date('2024-06-01');
    dto.fee_end_date = new Date('2024-09-30');
    dto.recreation_fee_code = 'C';
    dto.monday_ind = 'Y';
    dto.tuesday_ind = 'Y';
    dto.wednesday_ind = 'Y';
    dto.thursday_ind = 'Y';
    dto.friday_ind = 'Y';
    dto.saturday_ind = 'Y';
    dto.sunday_ind = 'Y';
    expect(dto.fee_amount).toBe(15);
    expect(dto.fee_start_date).toEqual(new Date('2024-06-01'));
    expect(dto.fee_end_date).toEqual(new Date('2024-09-30'));
    expect(dto.recreation_fee_code).toBe('C');
    expect(dto.monday_ind).toBe('Y');
    expect(dto.sunday_ind).toBe('Y');
  });
});

describe('RecreationStatusDto', () => {
  it('should assign properties', () => {
    const dto = new RecreationStatusDto();
    dto.status_code = 1;
    dto.comment = 'Closed';
    dto.description = 'Closed for weather';
    expect(dto.status_code).toBe(1);
    expect(dto.comment).toBe('Closed');
    expect(dto.description).toBe('Closed for weather');
  });
});

describe('RecreationStructureDto', () => {
  it('should assign properties', () => {
    const dto = new RecreationStructureDto();
    dto.has_toilet = true;
    dto.has_table = false;
    expect(dto.has_toilet).toBe(true);
    expect(dto.has_table).toBe(false);
  });
});

describe('RecreationResourceDistrictDto', () => {
  it('should assign properties', () => {
    const dto = new RecreationResourceDistrictDto();
    dto.district_code = 'RDCK';
    dto.description = 'Chilliwack';
    expect(dto.district_code).toBe('RDCK');
    expect(dto.description).toBe('Chilliwack');
  });
});
