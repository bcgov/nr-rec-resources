import { AuthContext } from '@/contexts/AuthContext';
import { Role } from '@/hooks/useAuthorizations';
import { ReactNode, useContext, useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';

export interface RoleRouteGuardProps {
  require: Role[];
  requireAll?: boolean;
  redirectTo: string;
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

export function RoleRouteGuard({
  require,
  requireAll = true,
  redirectTo,
  children,
}: RoleRouteGuardProps) {
  const userRoles = useUserRoles();
  const router = useRouter();
  const requirements = require;

  const isAllowed = requireAll
    ? requirements.every((role) => userRoles.includes(role))
    : requirements.some((role) => userRoles.includes(role));

  useEffect(() => {
    if (!isAllowed) {
      router.navigate({ to: redirectTo, replace: true });
    }
  }, [isAllowed, redirectTo, router]);

  if (!isAllowed) return null;

  return <>{children}</>;
}
