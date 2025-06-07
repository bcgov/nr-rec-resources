import { feeTypeMap, formatFeeDate, formatFeeDays } from './recreationFeeUtils';
import { RecreationFeeModel } from '@/service/custom-models';

describe('feeTypeMap', () => {
  it('returns correct fee type for known codes', () => {
    expect(feeTypeMap['C']).toBe('Camping');
    expect(feeTypeMap['D']).toBe('Day Use');
    expect(feeTypeMap['H']).toBe('Hut');
    expect(feeTypeMap['P']).toBe('Parking');
    expect(feeTypeMap['T']).toBe('Trail Use');
  });

  it('returns undefined for unknown codes', () => {
    expect(feeTypeMap['Z']).toBeUndefined();
  });
});

describe('formatFeeDate', () => {
  it('formats a valid date correctly', () => {
    const date = new Date('2024-02-01');
    expect(formatFeeDate(date)).toMatch(/February 1, 2024/);
  });

  it('returns "N/A" for null or undefined', () => {
    expect(formatFeeDate(null)).toBe('N/A');
    expect(formatFeeDate(undefined)).toBe('N/A');
  });
});

describe('formatFeeDays', () => {
  const baseFee: RecreationFeeModel = {
    fee_amount: 10,
    fee_start_date: new Date(),
    fee_end_date: new Date(),
    monday_ind: 'y',
    tuesday_ind: 'y',
    wednesday_ind: 'y',
    thursday_ind: 'y',
    friday_ind: 'y',
    saturday_ind: 'y',
    sunday_ind: 'y',
    recreation_fee_code: 'C',
  };

  it('returns "All Days" when all days are selected', () => {
    expect(formatFeeDays(baseFee)).toBe('All Days');
  });

  it('returns correct days when only some are selected', () => {
    const fee = { ...baseFee, saturday_ind: 'n', sunday_ind: 'n' };
    expect(formatFeeDays(fee)).toBe(
      'Monday, Tuesday, Wednesday, Thursday, Friday',
    );
  });

  it('returns single day when only one is selected', () => {
    const fee = {
      ...baseFee,
      monday_ind: 'n',
      tuesday_ind: 'n',
      wednesday_ind: 'n',
      thursday_ind: 'n',
      friday_ind: 'n',
      saturday_ind: 'n',
      sunday_ind: 'y',
    };
    expect(formatFeeDays(fee)).toBe('Sunday');
  });

  it('is case-insensitive for "Y"', () => {
    const fee = {
      ...baseFee,
      monday_ind: 'Y',
      tuesday_ind: 'y',
      wednesday_ind: 'N',
      thursday_ind: 'n',
      friday_ind: 'n',
      saturday_ind: 'n',
      sunday_ind: 'n',
    };
    expect(formatFeeDays(fee)).toBe('Monday, Tuesday');
  });
});
