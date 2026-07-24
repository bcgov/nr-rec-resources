import { useAuthorizations } from '@/hooks/useAuthorizations';
import { renderHook } from '@testing-library/react';
import { createAuthWrapper } from '../routes/helpers/roleGuardTestHelper';
import { describe, expect, it } from 'vitest';

describe('useAuthorizations', () => {
  it('viewer role', () => {
    const { result } = renderHook(() => useAuthorizations(), {
      wrapper: createAuthWrapper(['rst-viewer']),
    });

    expect(result.current).toEqual({
      canView: true,
      canEdit: false,
      canEditArchived: false,
      canViewFeatureFlag: false,
      canEditFeatureFlag: false,
      isSuperAdmin: false,
    });
  });

  it('admin role', () => {
    const { result } = renderHook(() => useAuthorizations(), {
      wrapper: createAuthWrapper(['rst-admin']),
    });

    expect(result.current).toEqual({
      canView: true,
      canEdit: true,
      canEditArchived: false,
      canViewFeatureFlag: false,
      canEditFeatureFlag: false,
      isSuperAdmin: false,
    });
  });

  it('super-admin role', () => {
    const { result } = renderHook(() => useAuthorizations(), {
      wrapper: createAuthWrapper(['rst-super-admin']),
    });

    expect(result.current).toEqual({
      canView: true,
      canEdit: true,
      canEditArchived: true,
      canViewFeatureFlag: false,
      canEditFeatureFlag: false,
      isSuperAdmin: true,
    });
  });

  it('developer role only', () => {
    const { result } = renderHook(() => useAuthorizations(), {
      wrapper: createAuthWrapper(['rst-developer']),
    });

    expect(result.current).toEqual({
      canView: false,
      canEdit: false,
      canEditArchived: false,
      canViewFeatureFlag: false,
      canEditFeatureFlag: false,
      isSuperAdmin: false,
    });
  });

  it('viewer + developer roles', () => {
    const { result } = renderHook(() => useAuthorizations(), {
      wrapper: createAuthWrapper(['rst-viewer', 'rst-developer']),
    });

    expect(result.current).toEqual({
      canView: true,
      canEdit: false,
      canEditArchived: false,
      canViewFeatureFlag: true,
      canEditFeatureFlag: false,
      isSuperAdmin: false,
    });
  });

  it('admin + developer roles', () => {
    const { result } = renderHook(() => useAuthorizations(), {
      wrapper: createAuthWrapper(['rst-admin', 'rst-developer']),
    });

    expect(result.current).toEqual({
      canView: true,
      canEdit: true,
      canEditArchived: false,
      canViewFeatureFlag: true,
      canEditFeatureFlag: true,
      isSuperAdmin: false,
    });
  });

  it('super-admin + developer roles', () => {
    const { result } = renderHook(() => useAuthorizations(), {
      wrapper: createAuthWrapper(['rst-super-admin', 'rst-developer']),
    });

    expect(result.current).toEqual({
      canView: true,
      canEdit: true,
      canEditArchived: true,
      canViewFeatureFlag: true,
      canEditFeatureFlag: true,
      isSuperAdmin: true,
    });
  });
});
