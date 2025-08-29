import { ROUTE_PATHS } from '@/routes';
import { LinkWithQueryParams } from '@shared/components/link-with-query-params';
import { FC } from 'react';

export const RecResourceOverviewLink: FC<{
  rec_resource_id: string;
  children: React.ReactNode;
}> = ({ rec_resource_id, children }) => {
  return (
    <LinkWithQueryParams
      to={{
        pathname: ROUTE_PATHS.REC_RESOURCE_OVERVIEW.replace(
          ':id',
          rec_resource_id,
        ),
      }}
    >
      {children}
    </LinkWithQueryParams>
  );
};
