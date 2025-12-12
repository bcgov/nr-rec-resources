import { ROUTE_PATHS } from '@/constants/routes';
import { LinkWithQueryParams } from '@shared/components/link-with-query-params';
import { FC } from 'react';

export const RecResourceOverviewLink: FC<{
  rec_resource_id: string;
  children: React.ReactNode;
}> = ({ rec_resource_id, children }) => {
  return (
    <LinkWithQueryParams
      to={ROUTE_PATHS.REC_RESOURCE_OVERVIEW}
      params={{ id: rec_resource_id }}
    >
      {children}
    </LinkWithQueryParams>
  );
};
