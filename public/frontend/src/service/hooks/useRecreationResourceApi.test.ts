import { describe, it, expect } from 'vitest';
import { useRecreationResourceApi } from './useRecreationResourceApi';
import { RecreationResourceApi } from '@/service/recreation-resource';

describe('useRecreationResourceApi', () => {
  it('should return RecreationResourceApi instance with empty basePath', () => {
    const api = useRecreationResourceApi();

    expect(api).toBeInstanceOf(RecreationResourceApi);
  });
});
