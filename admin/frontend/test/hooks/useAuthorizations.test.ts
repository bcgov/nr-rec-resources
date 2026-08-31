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
      canViewFeatureFlag: false,
      canEditFeatureFlag: false,
      isSuperAdmin: false,
      canViewSensitiveInfo: true,
    });
  });

  it('idir-viewer role', () => {
    const { result } = renderHook(() => useAuthorizations(), {
      wrapper: createAuthWrapper(['rst-idir-viewer']),
    });

    expect(result.current).toEqual({
      canView: true,
      canEdit: false,
      canViewFeatureFlag: false,
      canEditFeatureFlag: false,
      isSuperAdmin: false,
      canViewSensitiveInfo: false,
    });
  });

  it('admin role', () => {
    const { result } = renderHook(() => useAuthorizations(), {
      wrapper: createAuthWrapper(['rst-admin']),
    });

    expect(result.current).toEqual({
      canView: true,
      canEdit: true,
      canViewFeatureFlag: false,
      canEditFeatureFlag: false,
      isSuperAdmin: false,
      canViewSensitiveInfo: true,
    });
  });

  it('super-admin role', () => {
    const { result } = renderHook(() => useAuthorizations(), {
      wrapper: createAuthWrapper(['rst-super-admin']),
    });

    expect(result.current).toEqual({
      canView: true,
      canEdit: true,
      canViewFeatureFlag: false,
      canEditFeatureFlag: false,
      isSuperAdmin: true,
      canViewSensitiveInfo: true,
    });
  });

  it('developer role only', () => {
    const { result } = renderHook(() => useAuthorizations(), {
      wrapper: createAuthWrapper(['rst-developer']),
    });

    expect(result.current).toEqual({
      canView: false,
      canEdit: false,
      canViewFeatureFlag: false,
      canEditFeatureFlag: false,
      isSuperAdmin: false,
      canViewSensitiveInfo: false,
    });
  });

  it('viewer + developer roles', () => {
    const { result } = renderHook(() => useAuthorizations(), {
      wrapper: createAuthWrapper(['rst-viewer', 'rst-developer']),
    });

    expect(result.current).toEqual({
      canView: true,
      canEdit: false,
      canViewFeatureFlag: true,
      canEditFeatureFlag: false,
      isSuperAdmin: false,
      canViewSensitiveInfo: true,
    });
  });

  it('admin + developer roles', () => {
    const { result } = renderHook(() => useAuthorizations(), {
      wrapper: createAuthWrapper(['rst-admin', 'rst-developer']),
    });

    expect(result.current).toEqual({
      canView: true,
      canEdit: true,
      canViewFeatureFlag: true,
      canEditFeatureFlag: true,
      isSuperAdmin: false,
      canViewSensitiveInfo: true,
    });
  });

  it('super-admin + developer roles', () => {
    const { result } = renderHook(() => useAuthorizations(), {
      wrapper: createAuthWrapper(['rst-super-admin', 'rst-developer']),
    });

    expect(result.current).toEqual({
      canView: true,
      canEdit: true,
      canViewFeatureFlag: true,
      canEditFeatureFlag: true,
      isSuperAdmin: true,
      canViewSensitiveInfo: true,
    });
  });
});
