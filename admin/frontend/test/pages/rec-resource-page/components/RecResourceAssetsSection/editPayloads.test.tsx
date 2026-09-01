import { describe, expect, it, vi } from 'vitest';
import {
  buildAssetUpdateDto,
  buildInspectionDatesDto,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/editPayloads';
import { parseNumber } from '@/utils/assetForm';
import type { AssetEditFormValues } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/AssetCardEdit';

// Mock the external parseNumber utility
vi.mock('@/utils/assetForm', () => ({
  parseNumber: vi.fn(),
}));

describe('Asset DTO Builders', () => {
  describe('buildAssetUpdateDto', () => {
    it('should correctly format non-empty values into DTO', () => {
      vi.mocked(parseNumber).mockImplementation((val) => Number(val));

      const input: AssetEditFormValues = {
        asset_comment: 'Test comment',
        asset_length: '10',
        asset_width: '20',
        asset_area: '200',
        actual_value: '5000',
      } as unknown as AssetEditFormValues;

      const result = buildAssetUpdateDto(input);

      expect(result).toEqual({
        asset_comment: 'Test comment',
        asset_length: 10,
        asset_width: 20,
        asset_area: 200,
        actual_value: 5000,
      });
    });

    it('should set asset_comment to null when empty or falsy', () => {
      vi.mocked(parseNumber).mockReturnValue(null);

      const input: AssetEditFormValues = {
        asset_comment: '',
        asset_length: '',
        asset_width: '',
        asset_area: '',
        actual_value: '',
      } as unknown as AssetEditFormValues;

      const result = buildAssetUpdateDto(input);

      expect(result.asset_comment).toBeNull();
    });

    it('should fall back to undefined for numeric fields when parseNumber returns null', () => {
      vi.mocked(parseNumber).mockReturnValue(null);

      const inputNull: AssetEditFormValues = {
        asset_comment: 'Valid comment',
        asset_length: 'invalid',
        asset_width: 'invalid',
        asset_area: 'invalid',
        actual_value: 'invalid',
      } as unknown as AssetEditFormValues;

      const resultNull = buildAssetUpdateDto(inputNull);

      expect(resultNull).toEqual({
        asset_comment: 'Valid comment',
        asset_length: undefined,
        asset_width: undefined,
        asset_area: undefined,
        actual_value: undefined,
      });
    });
  });

  describe('buildInspectionDatesDto', () => {
    it('should return date values when valid strings are provided', () => {
      const result = buildInspectionDatesDto('2026-01-15', '2026-02-20');

      expect(result).toEqual({
        last_rec_inspection_date: '2026-01-15',
        last_hzrd_tree_assess_date: '2026-02-20',
      });
    });

    it('should set date fields to null when empty strings or falsy values are provided', () => {
      const result = buildInspectionDatesDto('', '');

      expect(result).toEqual({
        last_rec_inspection_date: null,
        last_hzrd_tree_assess_date: null,
      });
    });
  });
});
