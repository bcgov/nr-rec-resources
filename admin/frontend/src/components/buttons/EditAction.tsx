import { LinkWithQueryParams } from '@shared/components/link-with-query-params';

type EditActionProps = {
  to: string;
  disabled?: boolean;
};

// Shared component for our edit actions
// Renders a semantically correct link styled as a button when enabled,
// and a disabled <button> when the action is disabled.
export const EditAction = ({ to, disabled = false }: EditActionProps) => {
  if (disabled) {
    return (
      <button className="btn btn-outline-primary" disabled>
        Edit
      </button>
    );
  }

  return (
    <LinkWithQueryParams to={to} className="btn btn-outline-primary">
      Edit
    </LinkWithQueryParams>
  );
};
