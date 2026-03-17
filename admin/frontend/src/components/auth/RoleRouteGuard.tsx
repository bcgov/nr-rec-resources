import { Role, useUserRoles } from '@/hooks/useAuthorizations';
import { ReactNode, useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';

export interface RoleRouteGuardProps {
  readonly requireAll?: readonly Role[];
  readonly requireAny?: readonly Role[];
  readonly redirectTo: string;
  readonly children: ReactNode;
}

export function RoleRouteGuard({
  requireAll = [],
  requireAny = [],
  redirectTo,
  children,
}: Readonly<RoleRouteGuardProps>) {
  const userRoles = useUserRoles();
  const router = useRouter();
  const meetsAllRequirements = requireAll.every((role) =>
    userRoles.includes(role),
  );
  const meetsAnyRequirements =
    requireAny.length === 0 ||
    requireAny.some((role) => userRoles.includes(role));
  const isAllowed = meetsAllRequirements && meetsAnyRequirements;

  useEffect(() => {
    if (!isAllowed) {
      router.navigate({ to: redirectTo, replace: true });
    }
  }, [isAllowed, redirectTo, router]);

  if (!isAllowed) return null;

  return <>{children}</>;
}
