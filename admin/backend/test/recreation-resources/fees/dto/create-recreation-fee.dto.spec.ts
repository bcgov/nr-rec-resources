import { CreateRecreationFeeDto } from '@/recreation-resources/fees/dto/create-recreation-fee.dto';
import { describe, expect, it } from 'vitest';

describe('CreateRecreationFeeDto', () => {
  it('should create an instance', () => {
    const dto = new CreateRecreationFeeDto();
    expect(dto).toBeInstanceOf(CreateRecreationFeeDto);
  });

  it('should assign all properties correctly', () => {
    const dto = new CreateRecreationFeeDto();
    dto.recreation_fee_code = 'C';
    dto.fee_amount = 15.5;
    dto.fee_start_date = '2024-06-01';
    dto.fee_end_date = '2024-09-30';
    dto.monday_ind = 'Y';
    dto.tuesday_ind = 'N';
    dto.wednesday_ind = 'Y';
    dto.thursday_ind = 'N';
    dto.friday_ind = 'Y';
    dto.saturday_ind = 'Y';
    dto.sunday_ind = 'N';

    expect(dto.recreation_fee_code).toBe('C');
    expect(dto.fee_amount).toBe(15.5);
    expect(dto.fee_start_date).toBe('2024-06-01');
    expect(dto.fee_end_date).toBe('2024-09-30');
    expect(dto.monday_ind).toBe('Y');
    expect(dto.tuesday_ind).toBe('N');
    expect(dto.wednesday_ind).toBe('Y');
    expect(dto.thursday_ind).toBe('N');
    expect(dto.friday_ind).toBe('Y');
    expect(dto.saturday_ind).toBe('Y');
    expect(dto.sunday_ind).toBe('N');
  });
});
