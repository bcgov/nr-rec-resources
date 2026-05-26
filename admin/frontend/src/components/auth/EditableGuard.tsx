import { Role } from '@/hooks/useAuthorizations';
import { ReactNode } from 'react';
import { ArchiveGuard } from './ArchiveGuard';
import { RoleGuard } from './RoleGuard';

export interface EditableGuardProps {
  readonly isArchived?: boolean;
  readonly requireAll?: readonly Role[];
  readonly requireAny?: readonly Role[];
  readonly fallback?: ReactNode;
  readonly children: ReactNode;
}

export function EditableGuard({
  isArchived = false,
  requireAll,
  requireAny,
  fallback = null,
  children,
}: Readonly<EditableGuardProps>) {
  return (
    <RoleGuard
      requireAll={requireAll}
      requireAny={requireAny}
      fallback={fallback}
    >
      <ArchiveGuard isArchived={isArchived} fallback={fallback}>
        {children}
      </ArchiveGuard>
    </RoleGuard>
  );
}
