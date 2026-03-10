import { ROUTE_PATHS } from '@/constants/routes';
import { Link } from '@tanstack/react-router';
import { FC } from 'react';

export const RecResourceOverviewLink: FC<{
  rec_resource_id: string;
  children: React.ReactNode;
}> = ({ rec_resource_id, children }) => {
  return (
    <Link
      to={ROUTE_PATHS.REC_RESOURCE_OVERVIEW}
      params={{ id: rec_resource_id }}
    >
      {children}
    </Link>
  );
};
