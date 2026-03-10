import { Role, useUserRoles } from '@/hooks/useAuthorizations';
import { ReactNode } from 'react';

export interface RoleGuardProps {
  requireAll?: Role[];
  requireAny?: Role[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function RoleGuard({
  requireAll = [],
  requireAny = [],
  fallback = null,
  children,
}: RoleGuardProps) {
  const userRoles = useUserRoles();

  const meetsAllRequirements =
    requireAll.length === 0 ||
    requireAll.every((role) => userRoles.includes(role));
  const meetsAnyRequirements =
    requireAny.length === 0 ||
    requireAny.some((role) => userRoles.includes(role));
  const isAllowed = meetsAllRequirements && meetsAnyRequirements;

  if (!isAllowed) return <>{fallback}</>;

  return <>{children}</>;
}
