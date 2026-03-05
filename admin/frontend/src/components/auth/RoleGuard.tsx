import { AuthContext } from '@/contexts/AuthContext';
import { Role } from '@/hooks/useAuthorizations';
import { ReactNode, useContext } from 'react';

export interface RoleGuardProps {
  require: Role[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

const useUserRoles = (): string[] => {
  const context = useContext(AuthContext);
  if (!context) {
    return [];
  }

  const { user, authService } = context;
  return user?.client_roles ?? authService.getUserRoles();
};

export function RoleGuard({
  require,
  requireAll = true,
  fallback = null,
  children,
}: RoleGuardProps) {
  const userRoles = useUserRoles();

  const isAllowed = requireAll
    ? require.every((role) => userRoles.includes(role))
    : require.some((role) => userRoles.includes(role));

  if (!isAllowed) return <>{fallback}</>;

  return <>{children}</>;
}
