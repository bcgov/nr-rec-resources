import * as OptionsIndex from '@/recreation-resources/options/index';
import { describe, expect, it } from 'vitest';

describe('Options Index', () => {
  it('should export all options modules', () => {
    expect(OptionsIndex.OptionsController).toBeDefined();
    expect(OptionsIndex.OptionsModule).toBeDefined();
    expect(OptionsIndex.OptionsRepository).toBeDefined();
    expect(OptionsIndex.OptionsService).toBeDefined();
  });

  it('should export option DTO', () => {
    expect(OptionsIndex.OptionDto).toBeDefined();
  });

  it('should export option types constant', () => {
    expect(OptionsIndex.OPTION_TYPES).toBeDefined();
    expect(OptionsIndex.OPTION_TYPES.ACTIVITIES).toBe('activities');
    expect(OptionsIndex.OPTION_TYPES.FEATURE_CODE).toBe('featureCode');
  });
});
