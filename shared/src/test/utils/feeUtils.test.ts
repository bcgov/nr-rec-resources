import { describe, expect, it } from 'vitest';
import {
  feeTypeMap,
  formatFeeDate,
  formatFeeDays,
  getFeeDaysArray,
  getFeeTypeLabel,
  type FeeWithDayIndicators,
} from '../../utils/feeUtils';

describe('feeTypeMap', () => {
  it('contains all expected fee type codes', () => {
    expect(feeTypeMap['C']).toBe('Camping');
    expect(feeTypeMap['D']).toBe('Day Use');
    expect(feeTypeMap['H']).toBe('Hut');
    expect(feeTypeMap['P']).toBe('Parking');
    expect(feeTypeMap['T']).toBe('Trail Use');
  });
});

describe('getFeeTypeLabel', () => {
  it('returns correct label for known codes', () => {
    expect(getFeeTypeLabel('C')).toBe('Camping');
    expect(getFeeTypeLabel('D')).toBe('Day Use');
    expect(getFeeTypeLabel('H')).toBe('Hut');
    expect(getFeeTypeLabel('P')).toBe('Parking');
    expect(getFeeTypeLabel('T')).toBe('Trail Use');
  });

  it('handles numeric codes', () => {
    // In case codes are passed as numbers
    expect(getFeeTypeLabel(67)).toBe('Unknown Fee Type');
  });

  it('returns "Unknown Fee Type" for unknown codes', () => {
    expect(getFeeTypeLabel('Z')).toBe('Unknown Fee Type');
    expect(getFeeTypeLabel('')).toBe('Unknown Fee Type');
  });
});

describe('formatFeeDate', () => {
  it('formats a valid date correctly', () => {
    const date = new Date('2024-02-01T00:00:00Z');
    const formatted = formatFeeDate(date);
    expect(formatted).toMatch(/Feb/);
    expect(formatted).toMatch(/2024/);
  });

  it('returns "N/A" for null', () => {
    expect(formatFeeDate(null)).toBe('N/A');
  });

  it('returns "N/A" for undefined', () => {
    expect(formatFeeDate(undefined)).toBe('N/A');
  });

  it('handles string dates', () => {
    const formatted = formatFeeDate('2024-02-01');
    expect(formatted).toBeTruthy();
    expect(formatted).not.toBe('N/A');
  });
});

describe('getFeeDaysArray', () => {
  const baseFee: FeeWithDayIndicators = {
    monday_ind: 'Y',
    tuesday_ind: 'Y',
    wednesday_ind: 'Y',
    thursday_ind: 'Y',
    friday_ind: 'Y',
    saturday_ind: 'Y',
    sunday_ind: 'Y',
  };

  describe('with full day names (default)', () => {
    it('returns ["All Days"] when all 7 days are selected', () => {
      expect(getFeeDaysArray(baseFee)).toEqual(['All Days']);
    });

    it('returns correct days array when only some are selected', () => {
      const fee = {
        ...baseFee,
        saturday_ind: 'N',
        sunday_ind: 'N',
      };
      expect(getFeeDaysArray(fee)).toEqual([
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
      ]);
    });

    it('returns single day array when only one is selected', () => {
      const fee = {
        monday_ind: 'N',
        tuesday_ind: 'N',
        wednesday_ind: 'N',
        thursday_ind: 'N',
        friday_ind: 'N',
        saturday_ind: 'N',
        sunday_ind: 'Y',
      };
      expect(getFeeDaysArray(fee)).toEqual(['Sunday']);
    });

    it('returns empty array when no days are selected', () => {
      const fee = {
        monday_ind: 'N',
        tuesday_ind: 'N',
        wednesday_ind: 'N',
        thursday_ind: 'N',
        friday_ind: 'N',
        saturday_ind: 'N',
        sunday_ind: 'N',
      };
      expect(getFeeDaysArray(fee)).toEqual([]);
    });

    it('returns empty array when day indicators are undefined', () => {
      const fee: FeeWithDayIndicators = {};
      expect(getFeeDaysArray(fee)).toEqual([]);
    });

    it('is case-insensitive for "Y"', () => {
      const fee = {
        monday_ind: 'Y',
        tuesday_ind: 'y',
        wednesday_ind: 'N',
        thursday_ind: 'n',
        friday_ind: 'Y',
        saturday_ind: 'y',
        sunday_ind: 'N',
      };
      expect(getFeeDaysArray(fee)).toEqual([
        'Monday',
        'Tuesday',
        'Friday',
        'Saturday',
      ]);
    });
  });

  describe('with abbreviated day names', () => {
    it('returns ["All days"] when all 7 days are selected', () => {
      expect(getFeeDaysArray(baseFee, { abbreviated: true })).toEqual([
        'All days',
      ]);
    });

    it('returns abbreviated day names array for selected days', () => {
      const fee = {
        ...baseFee,
        monday_ind: 'N',
        tuesday_ind: 'N',
        wednesday_ind: 'N',
        thursday_ind: 'N',
        friday_ind: 'N',
      };
      expect(getFeeDaysArray(fee, { abbreviated: true })).toEqual([
        'Sat',
        'Sun',
      ]);
    });

    it('returns single abbreviated day array when only one is selected', () => {
      const fee = {
        monday_ind: 'Y',
        tuesday_ind: 'N',
        wednesday_ind: 'N',
        thursday_ind: 'N',
        friday_ind: 'N',
        saturday_ind: 'N',
        sunday_ind: 'N',
      };
      expect(getFeeDaysArray(fee, { abbreviated: true })).toEqual(['Mon']);
    });

    it('returns empty array when no days are selected', () => {
      const fee = {
        monday_ind: 'N',
        tuesday_ind: 'N',
        wednesday_ind: 'N',
        thursday_ind: 'N',
        friday_ind: 'N',
        saturday_ind: 'N',
        sunday_ind: 'N',
      };
      expect(getFeeDaysArray(fee, { abbreviated: true })).toEqual([]);
    });
  });

  describe('with custom allDaysText', () => {
    it('uses custom text when all days are selected', () => {
      expect(getFeeDaysArray(baseFee, { allDaysText: 'Every day' })).toEqual([
        'Every day',
      ]);
    });

    it('uses custom text with abbreviated format', () => {
      expect(
        getFeeDaysArray(baseFee, {
          abbreviated: true,
          allDaysText: 'All week',
        }),
      ).toEqual(['All week']);
    });
  });
});

describe('formatFeeDays', () => {
  const baseFee: FeeWithDayIndicators = {
    monday_ind: 'Y',
    tuesday_ind: 'Y',
    wednesday_ind: 'Y',
    thursday_ind: 'Y',
    friday_ind: 'Y',
    saturday_ind: 'Y',
    sunday_ind: 'Y',
  };

  describe('with full day names (default)', () => {
    it('returns "All Days" when all 7 days are selected', () => {
      expect(formatFeeDays(baseFee)).toBe('All Days');
    });

    it('returns correct days when only some are selected', () => {
      const fee = {
        ...baseFee,
        saturday_ind: 'N',
        sunday_ind: 'N',
      };
      expect(formatFeeDays(fee)).toBe(
        'Monday, Tuesday, Wednesday, Thursday, Friday',
      );
    });

    it('returns single day when only one is selected', () => {
      const fee = {
        monday_ind: 'N',
        tuesday_ind: 'N',
        wednesday_ind: 'N',
        thursday_ind: 'N',
        friday_ind: 'N',
        saturday_ind: 'N',
        sunday_ind: 'Y',
      };
      expect(formatFeeDays(fee)).toBe('Sunday');
    });

    it('returns empty string when no days are selected', () => {
      const fee = {
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

    it('returns empty string when day indicators are undefined', () => {
      const fee: FeeWithDayIndicators = {};
      expect(formatFeeDays(fee)).toBe('');
    });

    it('is case-insensitive for "Y"', () => {
      const fee = {
        monday_ind: 'Y',
        tuesday_ind: 'y',
        wednesday_ind: 'N',
        thursday_ind: 'n',
        friday_ind: 'Y',
        saturday_ind: 'y',
        sunday_ind: 'N',
      };
      expect(formatFeeDays(fee)).toBe('Monday, Tuesday, Friday, Saturday');
    });
  });

  describe('with abbreviated day names', () => {
    it('returns "All days" when all 7 days are selected', () => {
      expect(formatFeeDays(baseFee, { abbreviated: true })).toBe('All days');
    });

    it('returns abbreviated day names for selected days', () => {
      const fee = {
        ...baseFee,
        monday_ind: 'N',
        tuesday_ind: 'N',
        wednesday_ind: 'N',
        thursday_ind: 'N',
        friday_ind: 'N',
      };
      expect(formatFeeDays(fee, { abbreviated: true })).toBe('Sat, Sun');
    });

    it('returns single abbreviated day when only one is selected', () => {
      const fee = {
        monday_ind: 'Y',
        tuesday_ind: 'N',
        wednesday_ind: 'N',
        thursday_ind: 'N',
        friday_ind: 'N',
        saturday_ind: 'N',
        sunday_ind: 'N',
      };
      expect(formatFeeDays(fee, { abbreviated: true })).toBe('Mon');
    });

    it('returns empty string when no days are selected', () => {
      const fee = {
        monday_ind: 'N',
        tuesday_ind: 'N',
        wednesday_ind: 'N',
        thursday_ind: 'N',
        friday_ind: 'N',
        saturday_ind: 'N',
        sunday_ind: 'N',
      };
      expect(formatFeeDays(fee, { abbreviated: true })).toBe('');
    });
  });

  describe('with custom allDaysText', () => {
    it('uses custom text when all days are selected', () => {
      expect(formatFeeDays(baseFee, { allDaysText: 'Every day' })).toBe(
        'Every day',
      );
    });

    it('uses custom text with abbreviated format', () => {
      expect(
        formatFeeDays(baseFee, {
          abbreviated: true,
          allDaysText: 'All week',
        }),
      ).toBe('All week');
    });
  });
});
