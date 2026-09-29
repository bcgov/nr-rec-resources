import { useState } from 'react';
import {
  Button,
  Col,
  Form,
  Row,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import { useAuthorizations } from '@/hooks/useAuthorizations';
import { AgreementHolderClientPublicViewDto } from '@/services/recreation-resource-admin';
import { PartnerCardHeader } from './PartnerCardHeader';
import './RecResourcePartnersContent.scss';

/** The subset of a partner the edit view can change. */
export interface PartnerAgreementDraft {
  agreementStartDate: string;
  agreementEndDate: string;
  visible_on_public_website: boolean;
}

export function toDraft(
  partner: AgreementHolderClientPublicViewDto,
): PartnerAgreementDraft {
  return {
    agreementStartDate: partner.agreementStartDate ?? '',
    agreementEndDate: partner.agreementEndDate ?? '',
    visible_on_public_website: partner.visible_on_public_website ?? false,
  };
}

export const DATE_ORDER_ERROR =
  'Agreement end date must be after the agreement start date.';

/** Empty dates are allowed; only a populated, out-of-order pair is invalid. */
export function getDateOrderError(draft: PartnerAgreementDraft): string | null {
  if (!draft.agreementStartDate || !draft.agreementEndDate) return null;
  return draft.agreementEndDate <= draft.agreementStartDate
    ? DATE_ORDER_ERROR
    : null;
}

interface PartnerAgreementCardEditProps {
  partner: AgreementHolderClientPublicViewDto;
  draft: PartnerAgreementDraft;
  onDraftChange: (
    agreementHolderId: number,
    draft: PartnerAgreementDraft,
  ) => void;
  onDelete: (partner: AgreementHolderClientPublicViewDto) => void;
  onCancelAgreement: (partner: AgreementHolderClientPublicViewDto) => void;
  disabled?: boolean;
}

export const PartnerAgreementCardEdit = ({
  partner,
  draft,
  onDraftChange,
  onDelete,
  onCancelAgreement,
  disabled = false,
}: PartnerAgreementCardEditProps) => {
  const [touched, setTouched] = useState(false);
  // Deleting a partner is a super-admin action; regular admins do not see the
  // button at all. The API enforces this independently via SuperAdminGuard.
  const { isSuperAdmin } = useAuthorizations();
  // A cancelled agreement is frozen: its dates and public-website visibility
  // are no longer editable. Delete stays available.
  const isFrozen = disabled || partner.cancelled;
  const dateError = getDateOrderError(draft);
  const toggleName = `partner-visibility-${partner.agreement_holder_id}`;

  const update = (patch: Partial<PartnerAgreementDraft>) => {
    setTouched(true);
    onDraftChange(partner.agreement_holder_id, { ...draft, ...patch });
  };

  return (
    <div className="partner-panel partner-panel--edit">
      {/* Row 1: identity + status. Status follows the draft, so the pill
          reacts as the user edits the end date. */}
      <PartnerCardHeader
        clientNumber={partner.clientNumber}
        clientName={partner.clientName}
        agreementEndDate={draft.agreementEndDate}
        cancelled={partner.cancelled}
      />

      {/* Row 2: public website visibility */}
      <Row className="mb-3">
        <Col xs={12}>
          <Form.Label
            className="partner-panel__toggle-label d-block mb-1"
            htmlFor={`${toggleName}-yes`}
          >
            Display as main contact on public website
          </Form.Label>
          <ToggleButtonGroup
            type="radio"
            name={toggleName}
            className="partner-toggle"
            value={draft.visible_on_public_website ? 'yes' : 'no'}
            onChange={(value: string) =>
              update({ visible_on_public_website: value === 'yes' })
            }
          >
            <ToggleButton
              id={`${toggleName}-yes`}
              value="yes"
              variant="outline-primary"
              className="partner-toggle__btn"
              disabled={isFrozen}
            >
              Yes
            </ToggleButton>
            <ToggleButton
              id={`${toggleName}-no`}
              value="no"
              variant="outline-primary"
              className="partner-toggle__btn"
              disabled={isFrozen}
            >
              No
            </ToggleButton>
          </ToggleButtonGroup>
        </Col>
      </Row>

      {/* Row 3: agreement dates */}
      <Row className="mb-3">
        <Col xs={12} md={6}>
          <Form.Group
            controlId={`agreement-start-${partner.agreement_holder_id}`}
          >
            <Form.Label className="fw-bold">Agreement start date</Form.Label>
            <Form.Control
              type="date"
              value={draft.agreementStartDate}
              disabled={isFrozen}
              onChange={(e) => update({ agreementStartDate: e.target.value })}
            />
          </Form.Group>
        </Col>
        <Col xs={12} md={6} className="mt-3 mt-md-0">
          <Form.Group
            controlId={`agreement-end-${partner.agreement_holder_id}`}
          >
            <Form.Label className="fw-bold">Agreement end date</Form.Label>
            <Form.Control
              type="date"
              value={draft.agreementEndDate}
              disabled={isFrozen}
              isInvalid={touched && Boolean(dateError)}
              onChange={(e) => update({ agreementEndDate: e.target.value })}
            />
            <Form.Control.Feedback type="invalid">
              {dateError}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Row 4: destructive actions. Immediate, not part of the section save. */}
      <Row>
        <Col xs={12} className="d-flex justify-content-end gap-2">
          {isSuperAdmin && (
            <Button
              variant="link"
              className="partner-panel__action-btn"
              disabled={disabled}
              onClick={() => onDelete(partner)}
            >
              Delete
            </Button>
          )}
          <Button
            variant="outline-secondary"
            className="partner-panel__action-btn partner-panel__action-btn--outlined"
            disabled={disabled || partner.cancelled}
            onClick={() => onCancelAgreement(partner)}
          >
            Cancel agreement
          </Button>
        </Col>
      </Row>
    </div>
  );
};
