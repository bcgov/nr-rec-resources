import { AlertBanner } from '@bcgov/design-system-react-components';
import { useAuthorizations } from '@/hooks/useAuthorizations';

export function ViewOnlyBanner() {
  const { canView, canEdit } = useAuthorizations();

  if (!canView || canEdit) return null;

  return (
    <AlertBanner variant="warning" isCloseable={false} role="status">
      You have view-only access. Editing options are unavailable.
    </AlertBanner>
  );
}
