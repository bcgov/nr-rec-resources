import { formatFeeDays } from '@/pages/rec-resource-page/components/RecResourceFeesSection/helpers';
import { RecreationFeeDto } from '@/services';
import { describe, expect, it } from 'vitest';

describe('formatFeeDays', () => {
  it('should return "All days" when all 7 days are selected', () => {
    const fee: RecreationFeeDto = {
      recreation_fee_code: 'C',
      fee_type_description: 'Camping',
      monday_ind: 'Y',
      tuesday_ind: 'Y',
      wednesday_ind: 'Y',
      thursday_ind: 'Y',
      friday_ind: 'Y',
      saturday_ind: 'Y',
      sunday_ind: 'Y',
    };

    expect(formatFeeDays(fee)).toBe('All days');
  });

  it('should return abbreviated day names for selected days', () => {
    const fee: RecreationFeeDto = {
      recreation_fee_code: 'D',
      fee_type_description: 'Day use',
      monday_ind: 'N',
      tuesday_ind: 'N',
      wednesday_ind: 'N',
      thursday_ind: 'N',
      friday_ind: 'N',
      saturday_ind: 'Y',
      sunday_ind: 'Y',
    };

    expect(formatFeeDays(fee)).toBe('Sat, Sun');
  });

  it('should return single day when only one day is selected', () => {
    const fee: RecreationFeeDto = {
      recreation_fee_code: 'P',
      fee_type_description: 'Parking',
      monday_ind: 'Y',
      tuesday_ind: 'N',
      wednesday_ind: 'N',
      thursday_ind: 'N',
      friday_ind: 'N',
      saturday_ind: 'N',
      sunday_ind: 'N',
    };

    expect(formatFeeDays(fee)).toBe('Mon');
  });

  it('should return empty string when no days are selected', () => {
    const fee: RecreationFeeDto = {
      recreation_fee_code: 'T',
      fee_type_description: 'Trail use',
      monday_ind: 'N',
      tuesday_ind: 'N',
      wednesday_ind: 'N',
      thursday_ind: 'N',
      friday_ind: 'N',
      saturday_ind: 'N',
      sunday_ind: 'N',
    };

    expect(formatFeeDays(fee)).toBe('');
  });

  it('should handle undefined day indicators', () => {
    const fee: RecreationFeeDto = {
      recreation_fee_code: 'C',
      fee_type_description: 'Camping',
    };

    expect(formatFeeDays(fee)).toBe('');
  });

  it('should handle mixed case day indicators', () => {
    const fee: RecreationFeeDto = {
      recreation_fee_code: 'D',
      fee_type_description: 'Day use',
      monday_ind: 'y',
      tuesday_ind: 'Y',
      wednesday_ind: 'n',
      thursday_ind: 'N',
      friday_ind: 'y',
      saturday_ind: 'Y',
      sunday_ind: 'n',
    };

    const result = formatFeeDays(fee);
    expect(result).toContain('Mon');
    expect(result).toContain('Tue');
    expect(result).toContain('Fri');
    expect(result).toContain('Sat');
    expect(result).not.toContain('Wed');
    expect(result).not.toContain('Thu');
    expect(result).not.toContain('Sun');
  });
});
