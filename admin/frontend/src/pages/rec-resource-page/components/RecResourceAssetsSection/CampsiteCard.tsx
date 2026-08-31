import { ReactNode } from 'react';
import { CustomButton } from '@/components';
import { StyledAccordion } from '../StyledAccordion';
import { formatCurrency } from './formatCurrency';
import './CampsiteCard.scss';

interface CampsiteCardProps {
  eventKey: string;
  description: string;
  structureCount: number;
  totalValue: number;
  children?: ReactNode;
  isDisabled?: boolean;
  isEditing?: boolean;
  isSaving?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
}

export function CampsiteCard({
  eventKey,
  description,
  structureCount,
  totalValue,
  children,
  isDisabled = false,
  isEditing = false,
  isSaving = false,
  onEdit,
  onSave,
  onCancel,
}: CampsiteCardProps) {
  return (
    <StyledAccordion
      eventKey={eventKey}
      defaultOpen={false}
      activeKey={isEditing ? eventKey : undefined}
      className={`campsite-card${isEditing ? ' campsite-card--editing' : ''}`}
      title={<span className="campsite-card__description">{description}</span>}
      headerEnd={
        <>
          <div className="campsite-card__secondary-info">
            <span className="campsite-card__secondary-info-text">
              {structureCount} asset{structureCount === 1 ? '' : 's'}
            </span>
            <span
              className="campsite-card__secondary-info-separator"
              aria-hidden="true"
            >
              •
            </span>
            <span className="campsite-card__secondary-info-text">
              {formatCurrency(totalValue)} total value
            </span>
          </div>
          {isEditing ? (
            <div className="d-flex gap-2">
              <CustomButton
                variant="outline-primary"
                className="asset-summary-action-btn"
                disabled={isSaving}
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel?.();
                }}
              >
                Cancel
              </CustomButton>
              <CustomButton
                variant="primary"
                className="asset-summary-action-btn"
                disabled={isSaving}
                onClick={(e) => {
                  e.stopPropagation();
                  onSave?.();
                }}
              >
                {isSaving ? 'Saving…' : 'Save changes'}
              </CustomButton>
            </div>
          ) : (
            onEdit && (
              <CustomButton
                variant="secondary"
                className="asset-summary-action-btn"
                disabled={isDisabled}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                Edit
              </CustomButton>
            )
          )}
        </>
      }
    >
      {children}
    </StyledAccordion>
  );
}
