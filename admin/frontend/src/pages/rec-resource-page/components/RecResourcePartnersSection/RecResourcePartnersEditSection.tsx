import { useMemo, useState } from 'react';
import { Button, Spinner, Stack } from 'react-bootstrap';
import { useNavigate } from '@tanstack/react-router';
import { ROUTE_PATHS } from '@/constants/routes';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal/DeleteConfirmationModal';
import {
  useDeleteAgreementHolder,
  useUpdateAgreementHolder,
} from '@/services/hooks/recreation-resource-admin';
import { AgreementHolderClientPublicViewDto } from '@/services/recreation-resource-admin';
import { addErrorNotification } from '@/store/notificationStore';
import {
  PartnerAgreementCardEdit,
  PartnerAgreementDraft,
  getDateOrderError,
  toDraft,
} from './PartnerAgreementCardEdit';
import './RecResourcePartnersContent.scss';

type DraftsById = Record<number, PartnerAgreementDraft>;

/** Only fields the user actually changed are sent. */
function buildUpdatePayload(
  partner: AgreementHolderClientPublicViewDto,
  draft: PartnerAgreementDraft,
) {
  const original = toDraft(partner);
  const payload: Record<string, unknown> = {};

  if (draft.agreementStartDate !== original.agreementStartDate) {
    // An emptied input clears the column; null is the wire representation.
    payload.agreementStartDate = draft.agreementStartDate || null;
  }
  if (draft.agreementEndDate !== original.agreementEndDate) {
    payload.agreementEndDate = draft.agreementEndDate || null;
  }
  if (draft.visible_on_public_website !== original.visible_on_public_website) {
    payload.visible_on_public_website = draft.visible_on_public_website;
  }

  return payload;
}

interface RecResourcePartnersEditSectionProps {
  partners: AgreementHolderClientPublicViewDto[];
  recResourceId: string;
}

export const RecResourcePartnersEditSection = ({
  partners,
  recResourceId,
}: RecResourcePartnersEditSectionProps) => {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<DraftsById>(() =>
    Object.fromEntries(
      partners.map((partner) => [
        partner.agreement_holder_id,
        toDraft(partner),
      ]),
    ),
  );
  const [partnerToDelete, setPartnerToDelete] =
    useState<AgreementHolderClientPublicViewDto | null>(null);
  const [partnerToCancel, setPartnerToCancel] =
    useState<AgreementHolderClientPublicViewDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { mutateAsync: updateAgreementHolder } = useUpdateAgreementHolder();
  const { mutateAsync: deleteAgreementHolder, isPending: isDeleting } =
    useDeleteAgreementHolder();

  const viewPath = ROUTE_PATHS.REC_RESOURCE_PARTNERS.replace(
    '$id',
    recResourceId,
  );
  const navigateToView = () => void navigate({ to: viewPath });

  const hasDateErrors = useMemo(
    () => Object.values(drafts).some((draft) => getDateOrderError(draft)),
    [drafts],
  );

  const handleDraftChange = (
    agreementHolderId: number,
    draft: PartnerAgreementDraft,
  ) => setDrafts((prev) => ({ ...prev, [agreementHolderId]: draft }));

  const handleSave = async () => {
    if (hasDateErrors) return;

    // Only changed cards produce a request; untouched ones are skipped.
    const changed = partners
      .map((partner) => ({
        partner,
        payload: buildUpdatePayload(
          partner,
          drafts[partner.agreement_holder_id] ?? toDraft(partner),
        ),
      }))
      .filter(({ payload }) => Object.keys(payload).length > 0);

    if (changed.length === 0) {
      navigateToView();
      return;
    }

    setIsSaving(true);
    try {
      for (const { partner, payload } of changed) {
        await updateAgreementHolder({
          recResourceId,
          agreementHolderId: partner.agreement_holder_id,
          dto: payload,
          silent: true,
        });
      }
      navigateToView();
    } catch {
      // The mutation's onError already surfaced the failure; stay on the page
      // so pending edits are not lost.
      addErrorNotification(
        'Some partner changes could not be saved.',
        'savePartners-error',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!partnerToDelete) return;
    const { agreement_holder_id } = partnerToDelete;
    try {
      await deleteAgreementHolder({
        recResourceId,
        agreementHolderId: agreement_holder_id,
      });
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[agreement_holder_id];
        return next;
      });
    } finally {
      setPartnerToDelete(null);
    }
  };

  const handleConfirmCancelAgreement = async () => {
    if (!partnerToCancel) return;
    try {
      await updateAgreementHolder({
        recResourceId,
        agreementHolderId: partnerToCancel.agreement_holder_id,
        dto: { cancelled: true },
      });
    } finally {
      setPartnerToCancel(null);
    }
  };

  const isBusy = isSaving || isDeleting;

  return (
    <Stack direction="vertical" gap={4}>
      <h2>Edit Partners</h2>

      {partners.length === 0 ? (
        <p>There are no partners to edit for this recreation resource.</p>
      ) : (
        <div className="rounded">
          {partners.map((partner) => (
            <PartnerAgreementCardEdit
              key={partner.agreement_holder_id}
              partner={partner}
              draft={drafts[partner.agreement_holder_id] ?? toDraft(partner)}
              onDraftChange={handleDraftChange}
              onDelete={setPartnerToDelete}
              onCancelAgreement={setPartnerToCancel}
              disabled={isBusy}
            />
          ))}
        </div>
      )}

      <Stack direction="horizontal" gap={2} className="justify-content-end">
        <Button
          variant="outline-primary"
          onClick={navigateToView}
          disabled={isBusy}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => void handleSave()}
          disabled={isBusy || hasDateErrors || partners.length === 0}
        >
          {isSaving ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Saving...
            </>
          ) : (
            'Save'
          )}
        </Button>
      </Stack>

      <DeleteConfirmationModal
        show={Boolean(partnerToDelete)}
        title="Delete partner"
        description={`Delete ${partnerToDelete?.clientName ?? partnerToDelete?.clientNumber ?? 'this partner'} from this recreation resource? This cannot be undone.`}
        isDeleting={isDeleting}
        onCancel={() => setPartnerToDelete(null)}
        onConfirm={() => void handleConfirmDelete()}
      />

      <DeleteConfirmationModal
        show={Boolean(partnerToCancel)}
        title="Cancel agreement"
        description={`Mark the agreement with ${partnerToCancel?.clientName ?? partnerToCancel?.clientNumber ?? 'this partner'} as cancelled? Cancelling cannot be undone, and the partner will no longer appear on the public website.`}
        onCancel={() => setPartnerToCancel(null)}
        onConfirm={() => void handleConfirmCancelAgreement()}
        confirmText="Cancel agreement"
        cancelText="Keep agreement"
      />
    </Stack>
  );
};
