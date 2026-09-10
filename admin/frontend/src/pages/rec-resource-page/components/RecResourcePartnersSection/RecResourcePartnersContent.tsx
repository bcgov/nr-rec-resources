import { Stack } from 'react-bootstrap';
import { ROUTE_PATHS } from '@/constants/routes';
import { Link } from '@tanstack/react-router';
import './RecResourcePartnersContent.scss';
import { PartnerListItem } from './interfaces';
import { RecResourcePartner } from './RecResourcePartner';

export const RecResourcePartnersContent = ({
  partners,
  recResourceId,
}: {
  partners: PartnerListItem[];
  recResourceId?: string;
}) => {
  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Active Partners</h2>
        <Stack direction="horizontal" gap={2}>
          {recResourceId ? (
            <>
              <Link
                to={ROUTE_PATHS.REC_RESOURCE_FEES_ADD.replace(
                  '$id',
                  recResourceId,
                )}
                className="btn btn-primary"
              >
                Add New
              </Link>
              <Link
                to={ROUTE_PATHS.REC_RESOURCE_FEES_ADD.replace(
                  '$id',
                  recResourceId,
                )}
                className="btn btn-primary"
              >
                Edit
              </Link>
            </>
          ) : null}
        </Stack>
      </div>
      <div className="rounded">
        {partners.map((partner) => {
          return (
            <RecResourcePartner key={partner.clientNumber} partner={partner} />
          );
        })}
      </div>
    </Stack>
  );
};
