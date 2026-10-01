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
      canDelete: false,
      canViewFeatureFlag: false,
      canEditFeatureFlag: false,
      isSuperAdmin: false,
      canViewSensitiveInfo: true,
      canViewPartners: true,
      canViewPartnerSensitiveInfo: true,
      canManagePartners: false,
    });
  });

  it('idir-viewer role', () => {
    const { result } = renderHook(() => useAuthorizations(), {
      wrapper: createAuthWrapper(['rst-idir-viewer']),
    });

    expect(result.current).toEqual({
      canView: true,
      canEdit: false,
      canDelete: false,
      canViewFeatureFlag: false,
      canEditFeatureFlag: false,
      isSuperAdmin: false,
      canViewSensitiveInfo: false,
      canViewPartners: true,
      canViewPartnerSensitiveInfo: false,
      canManagePartners: false,
    });
  });

  it('admin role', () => {
    const { result } = renderHook(() => useAuthorizations(), {
      wrapper: createAuthWrapper(['rst-admin']),
    });

    expect(result.current).toEqual({
      canView: true,
      canEdit: true,
      canDelete: true,
      canViewFeatureFlag: false,
      canEditFeatureFlag: false,
      isSuperAdmin: false,
      canViewSensitiveInfo: true,
      canViewPartners: true,
      canViewPartnerSensitiveInfo: true,
      canManagePartners: false,
    });
  });

  it('super-admin role', () => {
    const { result } = renderHook(() => useAuthorizations(), {
      wrapper: createAuthWrapper(['rst-super-admin']),
    });

    expect(result.current).toEqual({
      canView: true,
      canEdit: true,
      canDelete: true,
      canViewFeatureFlag: false,
      canEditFeatureFlag: false,
      isSuperAdmin: true,
      canViewSensitiveInfo: true,
      canViewPartners: true,
      canViewPartnerSensitiveInfo: true,
      canManagePartners: true,
    });
  });

  it('developer role only', () => {
    const { result } = renderHook(() => useAuthorizations(), {
      wrapper: createAuthWrapper(['rst-developer']),
    });

    expect(result.current).toEqual({
      canView: false,
      canEdit: false,
      canDelete: true,
      canViewFeatureFlag: false,
      canEditFeatureFlag: false,
      isSuperAdmin: false,
      canViewSensitiveInfo: false,
      canViewPartners: false,
      canViewPartnerSensitiveInfo: false,
      canManagePartners: false,
    });
  });

  it('viewer + developer roles', () => {
    const { result } = renderHook(() => useAuthorizations(), {
      wrapper: createAuthWrapper(['rst-viewer', 'rst-developer']),
    });

    expect(result.current).toEqual({
      canView: true,
      canEdit: false,
      canDelete: true,
      canViewFeatureFlag: true,
      canEditFeatureFlag: false,
      isSuperAdmin: false,
      canViewSensitiveInfo: true,
      canViewPartners: true,
      canViewPartnerSensitiveInfo: true,
      canManagePartners: false,
    });
  });

  it('admin + developer roles', () => {
    const { result } = renderHook(() => useAuthorizations(), {
      wrapper: createAuthWrapper(['rst-admin', 'rst-developer']),
    });

    expect(result.current).toEqual({
      canView: true,
      canEdit: true,
      canDelete: true,
      canViewFeatureFlag: true,
      canEditFeatureFlag: true,
      isSuperAdmin: false,
      canViewSensitiveInfo: true,
      canViewPartners: true,
      canViewPartnerSensitiveInfo: true,
      canManagePartners: false,
    });
  });

  it('super-admin + developer roles', () => {
    const { result } = renderHook(() => useAuthorizations(), {
      wrapper: createAuthWrapper(['rst-super-admin', 'rst-developer']),
    });

    expect(result.current).toEqual({
      canView: true,
      canEdit: true,
      canDelete: true,
      canViewFeatureFlag: true,
      canEditFeatureFlag: true,
      isSuperAdmin: true,
      canViewSensitiveInfo: true,
      canViewPartners: true,
      canViewPartnerSensitiveInfo: true,
      canManagePartners: true,
    });
  });
});
