import { describe, expect, it } from 'vitest';
import {
  FeeWithDescription,
  formatRecreationFeeResult,
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

  it('builds combined fee_type_description when subtype description exists', () => {
    const result = formatRecreationFeeResult({
      fee_id: 1,
      fee_amount: 20,
      fee_start_date: new Date('2024-06-01'),
      fee_end_date: new Date('2024-09-30'),
      recreation_fee_code: 'C',
      recreation_fee_sub_code: 'DAY',
      monday_ind: 'Y',
      recurring_ind: true,
      recurring_start_mmdd: '06-01',
      recurring_end_mmdd: '08-31',
      with_description: { description: 'Camping' },
      with_sub_description: { description: 'Day use' },
    } as any);

    const resultWithSubtype = result as any;

    expect(resultWithSubtype.recreation_fee_sub_code).toBe('DAY');
    expect(result.fee_type_description).toBe('Camping - Day use');
    expect(resultWithSubtype.fee_sub_type_description).toBe('Day use');
    expect(result.recurring_ind).toBe(true);
  });

  it('falls back to base description and false recurring when values are nullish', () => {
    const result = formatRecreationFeeResult({
      fee_id: 2,
      fee_amount: null,
      fee_start_date: null,
      fee_end_date: null,
      recreation_fee_code: 'D',
      recreation_fee_sub_code: null,
      recurring_ind: undefined,
      recurring_start_mmdd: null,
      recurring_end_mmdd: null,
      with_description: { description: 'Day use' },
      with_sub_description: null,
    } as any);

    const resultWithSubtype = result as any;

    expect(result.fee_amount).toBeUndefined();
    expect(result.fee_start_date).toBeUndefined();
    expect(result.fee_end_date).toBeUndefined();
    expect(resultWithSubtype.recreation_fee_sub_code).toBeUndefined();
    expect(result.fee_type_description).toBe('Day use');
    expect(resultWithSubtype.fee_sub_type_description).toBeUndefined();
    expect(result.recurring_ind).toBe(false);
    expect(result.recurring_start_mmdd).toBeUndefined();
    expect(result.recurring_end_mmdd).toBeUndefined();
  });
});
