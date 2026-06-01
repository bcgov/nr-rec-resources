import { ReactNode } from 'react';

export interface ArchiveGuardProps {
  readonly isArchived: boolean;
  readonly fallback?: ReactNode;
  readonly children: ReactNode;
}

export function ArchiveGuard({
  isArchived,
  fallback = null,
  children,
}: Readonly<ArchiveGuardProps>) {
  if (isArchived) return <>{fallback}</>;

  return <>{children}</>;
}
