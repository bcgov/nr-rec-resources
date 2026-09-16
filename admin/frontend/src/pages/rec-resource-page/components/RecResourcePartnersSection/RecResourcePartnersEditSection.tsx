import { useMemo, useState } from 'react';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Form, Spinner, Stack } from 'react-bootstrap';
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

/** Today as a date-input value, in the browser's timezone — it's the day the
 * user sees on their own clock. */
function todayAsInputValue(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

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
  const [cancelDate, setCancelDate] = useState(todayAsInputValue);
  const [isSaving, setIsSaving] = useState(false);
  const [showMainPartnerWarning, setShowMainPartnerWarning] = useState(false);

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

  /**
   * At most one partner is the public-website contact, so turning the toggle
   * on for one card turns it off for every other. Cancelled partners are left
   * alone: they are frozen and never shown publicly anyway.
   */
  const handleDraftChange = (
    agreementHolderId: number,
    draft: PartnerAgreementDraft,
  ) =>
    setDrafts((prev) => {
      const next = { ...prev, [agreementHolderId]: draft };

      if (draft.visible_on_public_website) {
        for (const partner of partners) {
          const otherId = partner.agreement_holder_id;
          if (otherId === agreementHolderId || partner.cancelled) continue;

          const otherDraft = next[otherId] ?? toDraft(partner);
          if (otherDraft.visible_on_public_website) {
            next[otherId] = {
              ...otherDraft,
              visible_on_public_website: false,
            };
          }
        }
      }

      return next;
    });

  // Which partner currently holds the flag, persisted vs drafted. Used to warn
  // before a save that moves the public contact from one partner to another.
  const mainPartnerId = (
    source: (p: AgreementHolderClientPublicViewDto) => boolean,
  ) =>
    partners.find((p) => !p.cancelled && source(p))?.agreement_holder_id ??
    null;

  const persistedMainId = mainPartnerId(
    (p) => p.visible_on_public_website ?? false,
  );
  const draftedMainId = mainPartnerId(
    (p) =>
      (drafts[p.agreement_holder_id] ?? toDraft(p)).visible_on_public_website,
  );
  const hasMainPartnerChanged = persistedMainId !== draftedMainId;
  const draftedMainPartner = partners.find(
    (p) => p.agreement_holder_id === draftedMainId,
  );

  const handleSave = async () => {
    if (hasDateErrors) return;
    setShowMainPartnerWarning(false);

    // Only changed cards produce a request; untouched ones are skipped.
    // Cancelled agreements are frozen, so they never contribute.
    const changed = partners
      .filter((partner) => !partner.cancelled)
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

  const handleSaveClick = () => {
    if (hasDateErrors) return;
    if (hasMainPartnerChanged) {
      setShowMainPartnerWarning(true);
      return;
    }
    void handleSave();
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

  /** Each open starts from today, not whatever the last one left behind. */
  const handleRequestCancelAgreement = (
    partner: AgreementHolderClientPublicViewDto,
  ) => {
    setCancelDate(todayAsInputValue());
    setPartnerToCancel(partner);
  };

  const handleConfirmCancelAgreement = async () => {
    if (!partnerToCancel) return;
    const { agreement_holder_id } = partnerToCancel;
    try {
      const updated = await updateAgreementHolder({
        recResourceId,
        agreementHolderId: agreement_holder_id,
        dto: { cancelled: true, agreementEndDate: cancelDate },
      });
      // The card is frozen from here on, so mirror what the server actually
      // saved rather than guessing at it locally.
      setDrafts((prev) => {
        const draft = prev[agreement_holder_id];
        if (!draft) return prev;
        return {
          ...prev,
          [agreement_holder_id]: {
            ...draft,
            visible_on_public_website:
              updated?.visible_on_public_website ?? false,
            agreementEndDate:
              updated?.agreementEndDate ?? draft.agreementEndDate,
          },
        };
      });
    } finally {
      setPartnerToCancel(null);
    }
  };

  const isBusy = isSaving || isDeleting;

  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="mb-0">Edit Partners</h2>
        <Stack direction="horizontal" gap={2}>
          <Button
            variant="outline-primary"
            onClick={navigateToView}
            disabled={isBusy}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveClick}
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
      </div>

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
              onCancelAgreement={handleRequestCancelAgreement}
              disabled={isBusy}
            />
          ))}
        </div>
      )}

      <DeleteConfirmationModal
        show={showMainPartnerWarning}
        title="Display as main contact on public site"
        description={
          <>
            <div className="partner-main-contact-modal__warning">
              <FontAwesomeIcon
                icon={faExclamationTriangle as any}
                className="partner-main-contact-modal__warning-icon"
                aria-hidden="true"
              />
              <span>This will replace the current main contact.</span>
            </div>
            <p className="partner-main-contact-modal__detail">
              {draftedMainPartner
                ? `${draftedMainPartner.clientName ?? draftedMainPartner.clientNumber} will become the main contact displayed on the public site. Only one partner can be displayed at a time.`
                : 'No partner will be displayed as the main contact on the public site. Only one partner can be displayed at a time.'}
            </p>
          </>
        }
        className="partner-modal--tinted-header partner-main-contact-modal"
        size="lg"
        confirmText="Save changes"
        cancelText="Cancel"
        confirmVariant="primary"
        confirmIcon={null}
        onCancel={() => setShowMainPartnerWarning(false)}
        onConfirm={() => void handleSave()}
      />

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
        className="partner-modal--tinted-header"
        size="lg"
      >
        <Form.Group controlId="cancel-agreement-date" className="mt-3">
          <Form.Label className="fw-bold">Cancel</Form.Label>
          <Form.Control
            type="date"
            value={cancelDate}
            onChange={(e) => setCancelDate(e.target.value)}
          />
          <Form.Text className="partner-panel__toggle-label">
            This date will be saved as the agreement end date.
          </Form.Text>
        </Form.Group>
      </DeleteConfirmationModal>
    </Stack>
  );
};
