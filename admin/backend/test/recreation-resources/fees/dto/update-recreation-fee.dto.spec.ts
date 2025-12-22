import { UpdateRecreationFeeDto } from '@/recreation-resources/fees/dto/update-recreation-fee.dto';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

describe('UpdateRecreationFeeDto', () => {
  describe('validation', () => {
    it('should pass validation with empty payload (all fields optional)', async () => {
      const dto = new UpdateRecreationFeeDto();
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation for invalid recreation_fee_code', async () => {
      const dto = new UpdateRecreationFeeDto();
      dto.recreation_fee_code = 'aa';

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]!.property).toBe('recreation_fee_code');
      expect(errors[0]!.constraints).toHaveProperty('matches');
    });

    it('should fail validation for invalid day indicator', async () => {
      const dto = new UpdateRecreationFeeDto();
      dto.monday_ind = 'X';

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]!.property).toBe('monday_ind');
      expect(errors[0]!.constraints).toHaveProperty('matches');
    });

    it('should accept valid values including explicit null dates', async () => {
      const dto = new UpdateRecreationFeeDto();
      dto.recreation_fee_code = 'D';
      dto.fee_amount = 12.5;
      dto.fee_start_date = '2024-06-01';
      dto.fee_end_date = null;
      dto.monday_ind = 'Y';
      dto.sunday_ind = 'N';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when fee_amount is not a number', async () => {
      const dto = new UpdateRecreationFeeDto();
      (dto as any).fee_amount = 'not-a-number';

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]!.property).toBe('fee_amount');
      expect(errors[0]!.constraints).toHaveProperty('isNumber');
    });
  });
});
