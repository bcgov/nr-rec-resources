import { ReactNode } from 'react';

export interface ArchiveGuardProps {
  readonly isArchived: boolean;
  /** When true, bypasses the archived restriction (e.g. for rst-super-admin) */
  readonly bypass?: boolean;
  readonly fallback?: ReactNode;
  readonly children: ReactNode;
}

export function ArchiveGuard({
  isArchived,
  bypass = false,
  fallback = null,
  children,
}: Readonly<ArchiveGuardProps>) {
  if (isArchived && !bypass) return <>{fallback}</>;

  return <>{children}</>;
}
