import { describe, expect, it } from 'vitest';
import { IMPLEMENTED_EXPORT_DATASET_IDS } from '@/recreation-resources/exports/datasets';
import { EXPORT_DATASET_BUILDERS } from '@/recreation-resources/exports/datasets/registry';

describe('EXPORT_DATASET_BUILDERS', () => {
  it('registers every implemented export dataset', () => {
    const registeredIds = Object.keys(EXPORT_DATASET_BUILDERS).sort();
    const implementedIds = [...IMPLEMENTED_EXPORT_DATASET_IDS].sort();

    expect(registeredIds).toEqual(implementedIds);
  });
});
