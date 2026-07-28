import { useAuthorizations } from '@/hooks/useAuthorizations';
import { ReactNode } from 'react';

export interface EditableGuardProps {
  readonly isArchived?: boolean;
  readonly fallback?: ReactNode;
  readonly children: ReactNode;
}

/**
 * Guards edit actions behind role and archive status checks.
 *
 * - `rst-admin`: can edit non-archived resources only.
 * - `rst-super-admin`: can edit all resources, including archived ones.
 * - All other roles: editing is always hidden.
 */
export function EditableGuard({
  isArchived = false,
  fallback = null,
  children,
}: Readonly<EditableGuardProps>) {
  const { canEdit, isSuperAdmin } = useAuthorizations();

  const hasAccess = canEdit && (!isArchived || isSuperAdmin);

  if (!hasAccess) return <>{fallback}</>;

  return <>{children}</>;
}
