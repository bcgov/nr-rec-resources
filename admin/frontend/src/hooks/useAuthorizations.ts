import { useContext, useMemo } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export const ROLES = {
  VIEWER: 'rst-viewer',
  ADMIN: 'rst-admin',
  DEVELOPER: 'rst-developer',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

const hasAnyRole = (roles: string[], requiredRoles: string[]) =>
  requiredRoles.some((role) => roles.includes(role));

const getUserRoles = (context: React.ContextType<typeof AuthContext>) => {
  if (!context) {
    return [];
  }

  const { user, authService } = context;
  return user?.client_roles ?? authService.getUserRoles();
};

export const useUserRoles = () => {
  const context = useContext(AuthContext);
  return useMemo(() => getUserRoles(context), [context]);
};

export type AuthorizationKey =
  | 'canView'
  | 'canEdit'
  | 'canViewFeatureFlag'
  | 'canEditFeatureFlag';

export const useAuthorizations = () => {
  const context = useContext(AuthContext);

  return useMemo(() => {
    const roles = getUserRoles(context);
    const canView = hasAnyRole(roles, [ROLES.VIEWER, ROLES.ADMIN]);
    const canEdit = hasAnyRole(roles, [ROLES.ADMIN]);
    const hasDeveloperAccess = hasAnyRole(roles, [ROLES.DEVELOPER]);

    return {
      canView,
      canEdit,
      canViewFeatureFlag: hasDeveloperAccess && canView,
      canEditFeatureFlag: hasDeveloperAccess && canEdit,
    };
  }, [context]);
};
