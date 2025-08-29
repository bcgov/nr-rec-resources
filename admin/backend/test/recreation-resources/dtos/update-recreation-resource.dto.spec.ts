import {
  UpdateRecreationAccessCodeDto,
  UpdateRecreationResourceDto,
} from '@/recreation-resources/dtos/update-recreation-resource.dto';
import { describe, expect, it } from 'vitest';

describe('Update Recreation Resource DTOs', () => {
  describe('UpdateRecreationAccessCodeDto', () => {
    it('should create a valid UpdateRecreationAccessCodeDto with code and subAccessCodes', () => {
      const dto = new UpdateRecreationAccessCodeDto();
      dto.code = 'BOAT';
      dto.subAccessCodes = ['MOTOR', 'PADDLE'];

      expect(dto.code).toBe('BOAT');
      expect(dto.subAccessCodes).toEqual(['MOTOR', 'PADDLE']);
    });

    it('should create a valid UpdateRecreationAccessCodeDto with only code', () => {
      const dto = new UpdateRecreationAccessCodeDto();
      dto.code = 'ROAD';

      expect(dto.code).toBe('ROAD');
      expect(dto.subAccessCodes).toBeUndefined();
    });
  });

  describe('UpdateRecreationResourceDto', () => {
    it('should create a valid DTO with all fields', () => {
      const dto = new UpdateRecreationResourceDto();
      dto.maintenance_standard_code = '1';
      dto.control_access_code = 'G';
      const ac1 = new UpdateRecreationAccessCodeDto();
      ac1.code = 'BOAT';
      ac1.subAccessCodes = ['MOTOR'];
      const ac2 = new UpdateRecreationAccessCodeDto();
      ac2.code = 'ROAD';
      dto.accessCodes = [ac1, ac2];
      dto.status_code = 1;

      expect(dto.maintenance_standard_code).toBe('1');
      expect(dto.control_access_code).toBe('G');
      expect(dto.accessCodes).toHaveLength(2);
      expect(dto.status_code).toBe(1);
    });

    it('should create a valid DTO with only maintenance_standard_code', () => {
      const dto = new UpdateRecreationResourceDto();
      dto.maintenance_standard_code = '2';

      expect(dto.maintenance_standard_code).toBe('2');
      expect(dto.control_access_code).toBeUndefined();
      expect(dto.accessCodes).toBeUndefined();
      expect(dto.status_code).toBeUndefined();
    });

    it('should create a valid DTO with only status_code', () => {
      const dto = new UpdateRecreationResourceDto();
      dto.status_code = 2;

      expect(dto.status_code).toBe(2);
      expect(dto.maintenance_standard_code).toBeUndefined();
    });

    it('should create a valid DTO with only accessCodes', () => {
      const dto = new UpdateRecreationResourceDto();
      const ac = new UpdateRecreationAccessCodeDto();
      ac.code = 'TRAIL';
      dto.accessCodes = [ac];

      expect(dto.accessCodes).toHaveLength(1);
      expect(dto.accessCodes?.[0]?.code).toBe('TRAIL');
    });
  });
});
