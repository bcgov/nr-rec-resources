import {
  buildSelectFields,
  mapAccessOptions,
  mapResultToOptionDto,
  transformResultsToOptionDtos,
} from '@/recreation-resources/options/options.mapper';
import { TableMapping } from '@/recreation-resources/options/options.types';
import { describe, expect, it } from 'vitest';

describe('buildSelectFields', () => {
  it('should include idField and labelField', () => {
    const mapping: TableMapping = {
      idField: 'id',
      labelField: 'name',
      prismaModel: 'test_model',
    };

    const result = buildSelectFields(mapping);

    expect(result).toEqual({
      id: true,
      name: true,
    });
  });

  it('should include archivedField when provided', () => {
    const mapping: TableMapping = {
      idField: 'id',
      labelField: 'name',
      prismaModel: 'test_model',
      archivedField: 'is_archived',
    };

    const result = buildSelectFields(mapping);

    expect(result).toEqual({
      id: true,
      name: true,
      is_archived: true,
    });
  });

  it('should include additionalFields when provided', () => {
    const mapping: TableMapping = {
      idField: 'id',
      labelField: 'name',
      prismaModel: 'test_model',
      additionalFields: ['field1', 'field2'],
    };

    const result = buildSelectFields(mapping);

    expect(result).toEqual({
      id: true,
      name: true,
      field1: true,
      field2: true,
    });
  });

  it('should include all fields when all options are provided', () => {
    const mapping: TableMapping = {
      idField: 'id',
      labelField: 'name',
      prismaModel: 'test_model',
      archivedField: 'is_archived',
      additionalFields: ['extra_field'],
    };

    const result = buildSelectFields(mapping);

    expect(result).toEqual({
      id: true,
      name: true,
      is_archived: true,
      extra_field: true,
    });
  });
});

describe('mapResultToOptionDto', () => {
  it('should map basic fields (id and label)', () => {
    const mapping: TableMapping = {
      idField: 'code',
      labelField: 'description',
      prismaModel: 'test_model',
    };

    const result = mapResultToOptionDto(mapping, {
      code: 'ABC',
      description: 'Test Description',
    });

    expect(result).toEqual({
      id: 'ABC',
      label: 'Test Description',
    });
  });

  it('should convert numeric id to string', () => {
    const mapping: TableMapping = {
      idField: 'code',
      labelField: 'description',
      prismaModel: 'test_model',
    };

    const result = mapResultToOptionDto(mapping, {
      code: 123,
      description: 'Test',
    });

    expect(result.id).toBe('123');
    expect(typeof result.id).toBe('string');
  });

  it('should include is_archived when archivedField is provided and value is true', () => {
    const mapping: TableMapping = {
      idField: 'code',
      labelField: 'description',
      prismaModel: 'test_model',
      archivedField: 'is_archived',
    };

    const result = mapResultToOptionDto(mapping, {
      code: 'ABC',
      description: 'Test',
      is_archived: true,
    });

    expect(result).toEqual({
      id: 'ABC',
      label: 'Test',
      is_archived: true,
    });
  });

  it('should include is_archived when archivedField is provided and value is false', () => {
    const mapping: TableMapping = {
      idField: 'code',
      labelField: 'description',
      prismaModel: 'test_model',
      archivedField: 'is_archived',
    };

    const result = mapResultToOptionDto(mapping, {
      code: 'ABC',
      description: 'Test',
      is_archived: false,
    });

    expect(result).toEqual({
      id: 'ABC',
      label: 'Test',
      is_archived: false,
    });
  });

  it('should not include is_archived when archivedField is provided but value is undefined', () => {
    const mapping: TableMapping = {
      idField: 'code',
      labelField: 'description',
      prismaModel: 'test_model',
      archivedField: 'is_archived',
    };

    const result = mapResultToOptionDto(mapping, {
      code: 'ABC',
      description: 'Test',
    });

    expect(result).toEqual({
      id: 'ABC',
      label: 'Test',
    });
    expect(result.is_archived).toBeUndefined();
  });

  it('should preserve children property if present', () => {
    const mapping: TableMapping = {
      idField: 'code',
      labelField: 'description',
      prismaModel: 'test_model',
    };

    const children = [{ id: '1', label: 'Child' }];
    const result = mapResultToOptionDto(mapping, {
      code: 'ABC',
      description: 'Test',
      children,
    });

    expect(result.children).toEqual(children);
  });
});

describe('transformResultsToOptionDtos', () => {
  const basicMapping: TableMapping = {
    idField: 'code',
    labelField: 'description',
    prismaModel: 'test_model',
  };

  it('should transform results without middleware', async () => {
    const results = [
      { code: 'A', description: 'Option A' },
      { code: 'B', description: 'Option B' },
    ];

    const transformed = await transformResultsToOptionDtos(
      basicMapping,
      results,
    );

    expect(transformed).toEqual([
      { id: 'A', label: 'Option A' },
      { id: 'B', label: 'Option B' },
    ]);
  });

  it('should handle empty results array', async () => {
    const transformed = await transformResultsToOptionDtos(basicMapping, []);

    expect(transformed).toEqual([]);
  });

  it('should apply single middleware', async () => {
    const middleware = (mapped: any[]) => {
      return mapped.map((item) => ({ ...item, processed: true }));
    };

    const mapping: TableMapping = {
      ...basicMapping,
      middleware,
    };

    const results = [{ code: 'A', description: 'Option A' }];
    const transformed = await transformResultsToOptionDtos(mapping, results);

    expect(transformed).toEqual([
      { id: 'A', label: 'Option A', processed: true },
    ]);
  });

  it('should apply multiple middlewares in sequence', async () => {
    const middleware1 = (mapped: any[]) => {
      return mapped.map((item) => ({ ...item, step1: true }));
    };

    const middleware2 = (mapped: any[]) => {
      return mapped.map((item) => ({ ...item, step2: true }));
    };

    const mapping: TableMapping = {
      ...basicMapping,
      middleware: [middleware1, middleware2],
    };

    const results = [{ code: 'A', description: 'Option A' }];
    const transformed = await transformResultsToOptionDtos(mapping, results);

    expect(transformed).toEqual([
      { id: 'A', label: 'Option A', step1: true, step2: true },
    ]);
  });

  it('should pass both mapped and raw data to middleware', async () => {
    const middleware = (mapped: any[], raw: any[]) => {
      expect(raw).toEqual([
        { code: 'A', description: 'Option A', extra: 'data' },
      ]);
      return mapped;
    };

    const mapping: TableMapping = {
      ...basicMapping,
      middleware,
    };

    const results = [{ code: 'A', description: 'Option A', extra: 'data' }];
    await transformResultsToOptionDtos(mapping, results);
  });

  it('should handle archivedField in transformation', async () => {
    const mapping: TableMapping = {
      idField: 'code',
      labelField: 'description',
      prismaModel: 'test_model',
      archivedField: 'is_archived',
    };

    const results = [
      { code: 'A', description: 'Option A', is_archived: true },
      { code: 'B', description: 'Option B', is_archived: false },
    ];

    const transformed = await transformResultsToOptionDtos(mapping, results);

    expect(transformed).toEqual([
      { id: 'A', label: 'Option A', is_archived: true },
      { id: 'B', label: 'Option B', is_archived: false },
    ]);
  });
});

describe('mapAccessOptions', () => {
  it('returns empty array for empty input', () => {
    expect(mapAccessOptions([], [])).toEqual([]);
  });

  it('maps single access record without sub-access', () => {
    const raw = [
      {
        access_code: 'road',
        access_code_description: 'Road access',
      },
    ];
    const mapped = raw.map((r) => ({
      id: r.access_code,
      label: r.access_code_description,
    }));

    expect(mapAccessOptions(mapped, raw)).toEqual([
      { id: 'road', label: 'Road access', children: [] },
    ]);
  });

  it('groups sub-access records under their parent access', () => {
    const raw = [
      {
        access_code: 'road',
        access_code_description: 'Road access',
        sub_access_code: 'veh',
        sub_access_code_description: 'Vehicle',
      },
      {
        access_code: 'road',
        access_code_description: 'Road access',
        sub_access_code: 'ped',
        sub_access_code_description: 'Pedestrian',
      },
    ];
    const mapped = raw.map((r) => ({
      id: r.access_code,
      label: r.access_code_description,
    }));

    expect(mapAccessOptions(mapped, raw)).toEqual([
      {
        id: 'road',
        label: 'Road access',
        children: [
          { id: 'veh', label: 'Vehicle' },
          { id: 'ped', label: 'Pedestrian' },
        ],
      },
    ]);
  });

  it('handles duplicate records gracefully', () => {
    const raw = [
      {
        access_code: 'road',
        access_code_description: 'Road access',
      },
      {
        access_code: 'road',
        access_code_description: 'Road access',
        sub_access_code: 'veh',
        sub_access_code_description: 'Vehicle',
      },
      {
        access_code: 'road',
        access_code_description: 'Road access',
        sub_access_code: 'veh',
        sub_access_code_description: 'Vehicle',
      },
    ];
    const mapped = raw.map((r) => ({
      id: r.access_code,
      label: r.access_code_description,
    }));

    expect(mapAccessOptions(mapped, raw)).toEqual([
      {
        id: 'road',
        label: 'Road access',
        children: [
          { id: 'veh', label: 'Vehicle' },
          { id: 'veh', label: 'Vehicle' },
        ],
      },
    ]);
  });

  it('handles multiple access codes', () => {
    const raw = [
      {
        access_code: 'road',
        access_code_description: 'Road access',
        sub_access_code: 'veh',
        sub_access_code_description: 'Vehicle',
      },
      {
        access_code: 'trail',
        access_code_description: 'Trail access',
        sub_access_code: 'ped',
        sub_access_code_description: 'Pedestrian',
      },
    ];
    const mapped = raw.map((r) => ({
      id: r.access_code,
      label: r.access_code_description,
    }));

    const result = mapAccessOptions(mapped, raw);

    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe('road');
    expect(result[1]?.id).toBe('trail');
  });
});
