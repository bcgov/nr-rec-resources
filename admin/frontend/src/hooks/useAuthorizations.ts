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

export type AuthorizationKey = 'canView' | 'canEdit' | 'canViewFeatureFlag';

export const useAuthorizations = () => {
  const context = useContext(AuthContext);

  return useMemo(() => {
    if (!context) {
      return {
        canView: false,
        canEdit: false,
        canViewFeatureFlag: false,
      };
    }

    const { user, authService } = context;
    const roles = user?.client_roles ?? authService.getUserRoles();

    return {
      canView: hasAnyRole(roles, [ROLES.VIEWER, ROLES.ADMIN]),
      canEdit: hasAnyRole(roles, [ROLES.ADMIN]),
      canViewFeatureFlag: hasAnyRole(roles, [ROLES.DEVELOPER]),
    };
  }, [context]);
};
