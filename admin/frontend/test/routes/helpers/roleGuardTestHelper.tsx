import { AuthContext } from '@/contexts/AuthContext';
import { ROLES } from '@/hooks/useAuthorizations';
import { ReactNode } from 'react';

/**
 * Role test matrix for it.each: [label, roles[], shouldBeAllowed]
 */
export const ROLE_ACCESS_CASES = [
  ['rst-admin', [ROLES.ADMIN], true],
  ['rst-viewer', [ROLES.VIEWER], false],
  ['rst-developer', [ROLES.DEVELOPER], false],
  ['no roles', [], false],
] as const;

export type RoleAccessCase = (typeof ROLE_ACCESS_CASES)[number];

export const createAuthWrapper =
  (roles: readonly string[]) =>
  ({ children }: { children: ReactNode }) => (
    <AuthContext.Provider
      value={{
        user: { client_roles: [...roles] } as any,
        authService: { getUserRoles: () => [...roles] } as any,
        isAuthenticated: true,
        isAuthorized: true,
        isLoading: false,
        error: null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
