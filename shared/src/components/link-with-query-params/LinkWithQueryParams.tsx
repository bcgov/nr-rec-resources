import React from 'react';
import { Link, useLocation } from '@tanstack/react-router';

type LinkComponent = typeof Link;

/**
 * Link component that preserves query parameters from the current location.
 *
 * This component wraps TanStack Router's Link and automatically includes
 * the current search parameters in the navigation, ensuring feature flags
 * and other query params are maintained across route changes.
 */
export const LinkWithQueryParams = React.forwardRef<
  HTMLAnchorElement,
  Omit<React.ComponentProps<LinkComponent>, 'search'>
>((props, ref) => {
  const location = useLocation();
  const currentSearch = location.search; // e.g. '?enable_edit=true';
  return <Link {...props} search={currentSearch} ref={ref} />;
}) as LinkComponent;
