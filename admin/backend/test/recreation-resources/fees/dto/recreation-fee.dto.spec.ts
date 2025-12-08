import { RecreationFeeDto } from '@/recreation-resources/fees/dto/recreation-fee.dto';
import { describe, expect, it } from 'vitest';

describe('RecreationFeeDto', () => {
  it('should create an instance', () => {
    const dto = new RecreationFeeDto();
    expect(dto).toBeInstanceOf(RecreationFeeDto);
  });

  it('should assign all properties correctly', () => {
    const dto = new RecreationFeeDto();
    dto.fee_amount = 15.5;
    dto.fee_start_date = new Date('2024-06-01');
    dto.fee_end_date = new Date('2024-09-30');
    dto.recreation_fee_code = 'C';
    dto.fee_type_description = 'Camping';
    dto.monday_ind = 'Y';
    dto.tuesday_ind = 'N';
    dto.wednesday_ind = 'Y';
    dto.thursday_ind = 'N';
    dto.friday_ind = 'Y';
    dto.saturday_ind = 'Y';
    dto.sunday_ind = 'N';

    expect(dto.fee_amount).toBe(15.5);
    expect(dto.fee_start_date).toEqual(new Date('2024-06-01'));
    expect(dto.fee_end_date).toEqual(new Date('2024-09-30'));
    expect(dto.recreation_fee_code).toBe('C');
    expect(dto.fee_type_description).toBe('Camping');
    expect(dto.monday_ind).toBe('Y');
    expect(dto.tuesday_ind).toBe('N');
    expect(dto.wednesday_ind).toBe('Y');
    expect(dto.thursday_ind).toBe('N');
    expect(dto.friday_ind).toBe('Y');
    expect(dto.saturday_ind).toBe('Y');
    expect(dto.sunday_ind).toBe('N');
  });

  it('should allow optional fields to be undefined', () => {
    const dto = new RecreationFeeDto();
    dto.recreation_fee_code = 'D';
    dto.fee_type_description = 'Day use';

    expect(dto.recreation_fee_code).toBe('D');
    expect(dto.fee_type_description).toBe('Day use');
    expect(dto.fee_amount).toBeUndefined();
    expect(dto.fee_start_date).toBeUndefined();
    expect(dto.fee_end_date).toBeUndefined();
    expect(dto.monday_ind).toBeUndefined();
    expect(dto.tuesday_ind).toBeUndefined();
    expect(dto.wednesday_ind).toBeUndefined();
    expect(dto.thursday_ind).toBeUndefined();
    expect(dto.friday_ind).toBeUndefined();
    expect(dto.saturday_ind).toBeUndefined();
    expect(dto.sunday_ind).toBeUndefined();
  });
});
