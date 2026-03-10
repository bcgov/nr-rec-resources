import { Role, useUserRoles } from '@/hooks/useAuthorizations';
import { ReactNode } from 'react';

export interface RoleGuardProps {
  readonly requireAll?: readonly Role[];
  readonly requireAny?: readonly Role[];
  readonly fallback?: ReactNode;
  readonly children: ReactNode;
}

export function RoleGuard({
  requireAll = [],
  requireAny = [],
  fallback = null,
  children,
}: Readonly<RoleGuardProps>) {
  const userRoles = useUserRoles();

  const meetsAllRequirements = requireAll.every((role) =>
    userRoles.includes(role),
  );
  const meetsAnyRequirements =
    requireAny.length === 0 ||
    requireAny.some((role) => userRoles.includes(role));
  const isAllowed = meetsAllRequirements && meetsAnyRequirements;

  if (!isAllowed) return <>{fallback}</>;

  return <>{children}</>;
}
