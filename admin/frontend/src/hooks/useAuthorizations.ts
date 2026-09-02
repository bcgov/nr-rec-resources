import { useContext, useMemo } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export const ROLES = {
  /**
   * Automatically assigned to any IDIR user with no other RST role.
   * Read-only access; cannot view Client info (except name) or Estimated Repair Costs.
   */
  IDIR_VIEWER: 'rst-idir-viewer',
  /** Program Read-Only — read access including sensitive info (client details, repair costs). */
  VIEWER: 'rst-viewer',
  ADMIN: 'rst-admin',
  SUPER_ADMIN: 'rst-super-admin',
  DEVELOPER: 'rst-developer',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

const hasAnyRole = (roles: string[], requiredRoles: string[]) =>
  requiredRoles.some((role) => roles.includes(role));

const getUserRoles = (context: React.ContextType<typeof AuthContext>) => {
  if (!context) {
    return [];
  }

  const { authService } = context;
  // Always go through authService.getUserRoles() so the IDIR auto-assign
  // logic (injecting 'rst-idir-viewer' for IDIR users with no other RST role)
  // is applied consistently.
  return authService.getUserRoles();
};

export const useUserRoles = () => {
  const context = useContext(AuthContext);
  return useMemo(() => getUserRoles(context), [context]);
};

export type AuthorizationKey =
  | 'canView'
  | 'canEdit'
  | 'isSuperAdmin'
  | 'canViewFeatureFlag'
  | 'canEditFeatureFlag'
  | 'canViewSensitiveInfo';

export const useAuthorizations = () => {
  const context = useContext(AuthContext);

  return useMemo(() => {
    const roles = getUserRoles(context);
    const canView = hasAnyRole(roles, [
      ROLES.IDIR_VIEWER,
      ROLES.VIEWER,
      ROLES.ADMIN,
      ROLES.SUPER_ADMIN,
    ]);
    const canEdit = hasAnyRole(roles, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
    const hasDeveloperAccess = hasAnyRole(roles, [ROLES.DEVELOPER]);
    const isSuperAdmin = hasAnyRole(roles, [ROLES.SUPER_ADMIN]);
    /**
     * True for Program Read-Only, Admin, and Super Admin roles.
     * False for IDIR Read-Only — these users cannot see Client details
     * (beyond the publicly-shown name) or Estimated / Actual Repair Costs.
     */
    const canViewSensitiveInfo = hasAnyRole(roles, [
      ROLES.VIEWER,
      ROLES.ADMIN,
      ROLES.SUPER_ADMIN,
    ]);

    return {
      canView,
      canEdit,
      canViewFeatureFlag: hasDeveloperAccess && canView,
      canEditFeatureFlag: hasDeveloperAccess && canEdit,
      isSuperAdmin,
      canViewSensitiveInfo,
    };
  }, [context]);
};
