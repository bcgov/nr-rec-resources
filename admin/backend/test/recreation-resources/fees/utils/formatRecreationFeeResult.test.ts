import { describe, it, expect } from 'vitest';
import {
  formatRecreationFeeResult,
  FeeWithDescription,
} from '@/recreation-resources/fees/utils/formatRecreationFeeResult';

describe('formatRecreationFeeResult', () => {
  it('normalizes nulls to undefined, extracts description, and maps weekday flags', () => {
    const mock = {
      recreation_fee_code: 'TEST_CODE',
      fee_amount: null,
      fee_start_date: null,
      fee_end_date: null,
      monday_ind: null,
      tuesday_ind: 'Y',
      wednesday_ind: null,
      thursday_ind: 'N',
      friday_ind: null,
      saturday_ind: null,
      sunday_ind: null,
      rec_resource_id: 'res1',
      with_description: { description: 'Fee description' },
    } as unknown as FeeWithDescription;

    const dto = formatRecreationFeeResult(mock);

    expect(dto.recreation_fee_code).toBe('TEST_CODE');
    expect(dto.fee_amount).toBeUndefined();
    expect(dto.fee_start_date).toBeUndefined();
    expect(dto.fee_end_date).toBeUndefined();
    expect(dto.tuesday_ind).toBe('Y');
    expect(dto.monday_ind).toBeUndefined();
    expect(dto.thursday_ind).toBe('N');
    expect(dto.fee_type_description).toBe('Fee description');
    expect((dto as any).with_description).toBeUndefined();
  });

  it('keeps defined values intact and returns empty string for missing description', () => {
    const mock = {
      recreation_fee_code: 'C2',
      fee_amount: 12.5,
      fee_start_date: new Date('2024-01-01'),
      fee_end_date: new Date('2024-12-31'),
      monday_ind: 'Y',
      tuesday_ind: 'N',
      wednesday_ind: 'Y',
      thursday_ind: 'N',
      friday_ind: 'Y',
      saturday_ind: 'N',
      sunday_ind: 'N',
      rec_resource_id: 'res2',
      with_description: null,
    } as unknown as FeeWithDescription;

    const dto = formatRecreationFeeResult(mock);

    expect(dto.fee_amount).toBe(12.5);
    expect(dto.fee_start_date).toEqual(new Date('2024-01-01'));
    expect(dto.fee_end_date).toEqual(new Date('2024-12-31'));
    expect(dto.monday_ind).toBe('Y');
    expect(dto.fee_type_description).toBe('');
  });
});
