import React from 'react';
import { Link, useLocation } from '@tanstack/react-router';

type Props = React.ComponentProps<typeof Link> & {
  to: string;
};

export const LinkWithQueryParams: React.FC<Props> = ({
  to,
  children,
  ...props
}) => {
  const location = useLocation();

  const currentSearch = location.search; // e.g. '?enable_edit=true';

  return (
    <Link to={to} search={currentSearch} {...props}>
      {children}
    </Link>
  );
};
