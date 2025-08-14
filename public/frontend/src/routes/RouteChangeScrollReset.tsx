import { FC, ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router';

export const RouteChangeScrollReset: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return children;
};
