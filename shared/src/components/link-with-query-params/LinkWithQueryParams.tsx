import React from 'react';
import { Link, useLocation, LinkProps, To } from 'react-router-dom';

export const LinkWithQueryParams: React.FC<LinkProps> = ({
  to,
  children,
  ...props
}) => {
  const location = useLocation();
  const currentSearch = location.search; // e.g. '?enable_edit=true'

  // Preserve any existing search on the provided `to` by overwriting with currentSearch.
  const newTo: To =
    typeof to === 'string'
      ? `${to}${currentSearch}`
      : { ...to, search: currentSearch };

  return (
    <Link to={newTo} {...props}>
      {children}
    </Link>
  );
};
