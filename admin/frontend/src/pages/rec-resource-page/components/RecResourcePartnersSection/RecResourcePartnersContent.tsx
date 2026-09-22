import { Stack } from 'react-bootstrap';
import { ROUTE_PATHS } from '@/constants/routes';
import { Link } from '@tanstack/react-router';
import './RecResourcePartnersContent.scss';
import { RecResourcePartner } from './RecResourcePartner';
import { AgreementHolderClientPublicViewDto } from '@/services/recreation-resource-admin/models/AgreementHolderClientPublicViewDto';
import { useState } from 'react';
import { RecResourcePartnerAddNewModal } from './RecResourcePartnerAddNewModal';
import { CustomButton } from '@/components';

export const RecResourcePartnersContent = ({
  partners,
  recResourceId,
}: {
  partners: AgreementHolderClientPublicViewDto[];
  recResourceId?: string;
}) => {
  const [isAddNewPartnerModalOpen, setIsAddNewPartnerModalOpen] =
    useState(false);
  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Active Partners</h2>
        <Stack direction="horizontal" gap={2}>
          {recResourceId ? (
            <>
              <CustomButton
                onClick={() => setIsAddNewPartnerModalOpen(true)}
                variant="outline-primary"
              >
                Add New
              </CustomButton>
              <Link
                to={ROUTE_PATHS.REC_RESOURCE_PARTNERS_EDIT.replace(
                  '$id',
                  recResourceId,
                )}
                className="btn btn-outline-primary"
              >
                Edit
              </Link>
            </>
          ) : null}
        </Stack>
      </div>
      <div className="rounded">
        {partners.length === 0 && <h4>No active partners.</h4>}
        {partners.map((partner) => {
          return (
            <RecResourcePartner key={partner.clientNumber} partner={partner} />
          );
        })}
      </div>
      <RecResourcePartnerAddNewModal
        show={isAddNewPartnerModalOpen}
        rec_resource_id={recResourceId || ''}
        onCancel={() => setIsAddNewPartnerModalOpen(false)}
      />
    </Stack>
  );
};
