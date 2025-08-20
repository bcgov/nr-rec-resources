import { FC, ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * A React component that automatically scrolls the window to the top
 * whenever the route changes. This component, when wrapped around <Routes> component
 * ensures the scroll position resets on navigation.
 */
export const RouteChangeScrollReset: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return children;
};
