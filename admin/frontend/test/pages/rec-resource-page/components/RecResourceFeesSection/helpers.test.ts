import {
  formatFeeDays,
  formatRecurringMonthDay,
  getIndividualDays,
} from '@/pages/rec-resource-page/components/RecResourceFeesSection/helpers';
import { RecreationFeeDto } from '@/services';
import { describe, expect, it } from 'vitest';

describe('formatFeeDays', () => {
  it('should return "All days" when all 7 days are selected', () => {
    const fee: RecreationFeeDto = {
      fee_id: 1,
      recreation_fee_code: 'C',
      fee_type_description: 'Camping',
      recurring_ind: false,
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
      fee_id: 1,
      recreation_fee_code: 'D',
      fee_type_description: 'Day use',
      recurring_ind: false,
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
      fee_id: 1,
      recreation_fee_code: 'P',
      fee_type_description: 'Parking',
      recurring_ind: false,
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
      fee_id: 1,
      recreation_fee_code: 'T',
      fee_type_description: 'Trail use',
      recurring_ind: false,
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
      fee_id: 1,
      recreation_fee_code: 'C',
      fee_type_description: 'Camping',
      recurring_ind: false,
    };

    expect(formatFeeDays(fee)).toBe('');
  });

  it('should handle mixed case day indicators', () => {
    const fee: RecreationFeeDto = {
      fee_id: 1,
      recreation_fee_code: 'D',
      fee_type_description: 'Day use',
      recurring_ind: false,
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

describe('getIndividualDays', () => {
  it('should return ["All days"] when all 7 days are selected', () => {
    const fee: RecreationFeeDto = {
      fee_id: 1,
      recreation_fee_code: 'C',
      fee_type_description: 'Camping',
      recurring_ind: false,
      monday_ind: 'Y',
      tuesday_ind: 'Y',
      wednesday_ind: 'Y',
      thursday_ind: 'Y',
      friday_ind: 'Y',
      saturday_ind: 'Y',
      sunday_ind: 'Y',
    };

    expect(getIndividualDays(fee)).toEqual(['All days']);
  });

  it('should return array of abbreviated day names for selected days', () => {
    const fee: RecreationFeeDto = {
      fee_id: 1,
      recreation_fee_code: 'D',
      fee_type_description: 'Day use',
      recurring_ind: false,
      monday_ind: 'N',
      tuesday_ind: 'N',
      wednesday_ind: 'N',
      thursday_ind: 'N',
      friday_ind: 'N',
      saturday_ind: 'Y',
      sunday_ind: 'Y',
    };

    expect(getIndividualDays(fee)).toEqual(['Sat', 'Sun']);
  });

  it('should return array with single day when only one day is selected', () => {
    const fee: RecreationFeeDto = {
      fee_id: 1,
      recreation_fee_code: 'P',
      fee_type_description: 'Parking',
      recurring_ind: false,
      monday_ind: 'Y',
      tuesday_ind: 'N',
      wednesday_ind: 'N',
      thursday_ind: 'N',
      friday_ind: 'N',
      saturday_ind: 'N',
      sunday_ind: 'N',
    };

    expect(getIndividualDays(fee)).toEqual(['Mon']);
  });

  it('should return empty array when no days are selected', () => {
    const fee: RecreationFeeDto = {
      fee_id: 1,
      recreation_fee_code: 'T',
      fee_type_description: 'Trail use',
      recurring_ind: false,
      monday_ind: 'N',
      tuesday_ind: 'N',
      wednesday_ind: 'N',
      thursday_ind: 'N',
      friday_ind: 'N',
      saturday_ind: 'N',
      sunday_ind: 'N',
    };

    expect(getIndividualDays(fee)).toEqual([]);
  });

  it('should handle undefined day indicators', () => {
    const fee: RecreationFeeDto = {
      fee_id: 1,
      recreation_fee_code: 'C',
      fee_type_description: 'Camping',
      recurring_ind: false,
    };

    expect(getIndividualDays(fee)).toEqual([]);
  });
});

describe('formatRecurringMonthDay', () => {
  it('should format valid MM-DD to "Mon D" format', () => {
    expect(formatRecurringMonthDay('01-01')).toBe('Jan 1');
    expect(formatRecurringMonthDay('06-15')).toBe('Jun 15');
    expect(formatRecurringMonthDay('12-31')).toBe('Dec 31');
  });

  it('should format single digit days correctly', () => {
    expect(formatRecurringMonthDay('01-05')).toBe('Jan 5');
    expect(formatRecurringMonthDay('03-02')).toBe('Mar 2');
  });

  it('should return "--" for null or undefined', () => {
    expect(formatRecurringMonthDay(null)).toBe('--');
    expect(formatRecurringMonthDay(undefined)).toBe('--');
  });

  it('should return "--" for invalid format', () => {
    expect(formatRecurringMonthDay('1-1')).toBe('--');
    expect(formatRecurringMonthDay('01/01')).toBe('--');
    expect(formatRecurringMonthDay('2024-01-01')).toBe('--');
    expect(formatRecurringMonthDay('invalid')).toBe('--');
  });

  it('should return "--" for invalid month', () => {
    expect(formatRecurringMonthDay('00-15')).toBe('--');
    expect(formatRecurringMonthDay('13-15')).toBe('--');
    expect(formatRecurringMonthDay('99-15')).toBe('--');
  });

  it('should return "--" for invalid day in month', () => {
    expect(formatRecurringMonthDay('02-30')).toBe('--'); // Feb has max 29
    expect(formatRecurringMonthDay('04-31')).toBe('--'); // Apr has max 30
    expect(formatRecurringMonthDay('01-32')).toBe('--'); // Jan has max 31
    expect(formatRecurringMonthDay('02-00')).toBe('--'); // Day 0
  });

  it('should handle February with 29 days (leap year support)', () => {
    expect(formatRecurringMonthDay('02-29')).toBe('Feb 29');
  });

  it('should handle all months correctly', () => {
    const months = [
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '10',
      '11',
      '12',
    ];
    const expectedMonths = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    months.forEach((month, index) => {
      expect(formatRecurringMonthDay(`${month}-15`)).toContain(
        expectedMonths[index],
      );
    });
  });
});
