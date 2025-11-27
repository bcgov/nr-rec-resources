import {
  UpdateRecreationAccessCodeDto,
  UpdateRecreationResourceDto,
} from '@/recreation-resources/dtos/update-recreation-resource.dto';
import { describe, expect, it } from 'vitest';

describe('Update Recreation Resource DTOs', () => {
  describe('UpdateRecreationAccessCodeDto', () => {
    it('should create a valid UpdateRecreationAccessCodeDto with access_code and sub_access_codes', () => {
      const dto = new UpdateRecreationAccessCodeDto();
      dto.access_code = 'BOAT';
      dto.sub_access_codes = ['MOTOR', 'PADDLE'];

      expect(dto.access_code).toBe('BOAT');
      expect(dto.sub_access_codes).toEqual(['MOTOR', 'PADDLE']);
    });

    it('should create a valid UpdateRecreationAccessCodeDto with only access_code', () => {
      const dto = new UpdateRecreationAccessCodeDto();
      dto.access_code = 'ROAD';

      expect(dto.access_code).toBe('ROAD');
      expect(dto.sub_access_codes).toBeUndefined();
    });
  });

  describe('UpdateRecreationResourceDto', () => {
    it('should create a valid DTO with all fields', () => {
      const dto = new UpdateRecreationResourceDto();
      dto.maintenance_standard_code = '1';
      dto.control_access_code = 'G';
      dto.risk_rating_code = 'H';
      dto.project_established_date = new Date('2024-01-15');
      const ac1 = new UpdateRecreationAccessCodeDto();
      ac1.access_code = 'BOAT';
      ac1.sub_access_codes = ['MOTOR'];
      const ac2 = new UpdateRecreationAccessCodeDto();
      ac2.access_code = 'ROAD';
      dto.access_codes = [ac1, ac2];
      dto.status_code = 1;
      dto.district_code = 'CHWK';

      expect(dto.maintenance_standard_code).toBe('1');
      expect(dto.control_access_code).toBe('G');
      expect(dto.risk_rating_code).toBe('H');
      expect(dto.project_established_date?.toISOString().split('T')[0]).toBe(
        '2024-01-15',
      );
      expect(dto.access_codes).toHaveLength(2);
      expect(dto.status_code).toBe(1);
      expect(dto.district_code).toBe('CHWK');
    });

    it('should create a valid DTO with only maintenance_standard_code', () => {
      const dto = new UpdateRecreationResourceDto();
      dto.maintenance_standard_code = '2';

      expect(dto.maintenance_standard_code).toBe('2');
      expect(dto.control_access_code == null).toBe(true);
      expect(dto.risk_rating_code).toBeUndefined();
      expect(dto.project_established_date).toBeUndefined();
      expect(dto.access_codes).toBeUndefined();
      expect(dto.status_code).toBeUndefined();
    });

    it('should accept null control_access_code', () => {
      const dto = new UpdateRecreationResourceDto();
      dto.control_access_code = null as any;

      expect(dto.control_access_code).toBeNull();
    });

    it('should accept null risk_rating_code', () => {
      const dto = new UpdateRecreationResourceDto();
      dto.risk_rating_code = null as any;

      expect(dto.risk_rating_code).toBeNull();
    });

    it('should accept null project_established_date', () => {
      const dto = new UpdateRecreationResourceDto();
      dto.project_established_date = null as any;

      expect(dto.project_established_date).toBeNull();
    });

    it('should create a valid DTO with only status_code', () => {
      const dto = new UpdateRecreationResourceDto();
      dto.status_code = 2;

      expect(dto.status_code).toBe(2);
      expect(dto.maintenance_standard_code).toBeUndefined();
    });

    it('should create a valid DTO with only access_codes', () => {
      const dto = new UpdateRecreationResourceDto();
      const ac = new UpdateRecreationAccessCodeDto();
      ac.access_code = 'TRAIL';
      dto.access_codes = [ac];

      expect(dto.access_codes).toHaveLength(1);
      expect(dto.access_codes?.[0]?.access_code).toBe('TRAIL');
    });

    it('should create a valid DTO with only district_code', () => {
      const dto = new UpdateRecreationResourceDto();
      dto.district_code = 'CHWK';

      expect(dto.district_code).toBe('CHWK');
      expect(dto.maintenance_standard_code).toBeUndefined();
    });

    it('should create a valid DTO with only risk_rating_code', () => {
      const dto = new UpdateRecreationResourceDto();
      dto.risk_rating_code = 'L';

      expect(dto.risk_rating_code).toBe('L');
      expect(dto.maintenance_standard_code).toBeUndefined();
    });

    it('should create a valid DTO with only project_established_date', () => {
      const dto = new UpdateRecreationResourceDto();
      dto.project_established_date = new Date('2024-06-20');

      expect(dto.project_established_date?.toISOString().split('T')[0]).toBe(
        '2024-06-20',
      );
      expect(dto.maintenance_standard_code).toBeUndefined();
    });
  });
});
