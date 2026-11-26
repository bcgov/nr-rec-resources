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
      isSuperAdmin: false,
      canViewSensitiveInfo: true,
      canViewAdjudicationReports: true,
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
      isSuperAdmin: false,
      canViewSensitiveInfo: false,
      canViewAdjudicationReports: false,
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
      isSuperAdmin: false,
      canViewSensitiveInfo: true,
      canViewAdjudicationReports: true,
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
      isSuperAdmin: true,
      canViewSensitiveInfo: true,
      canViewAdjudicationReports: true,
      canViewPartnerSensitiveInfo: true,
      canManagePartners: true,
    });
  });
});
