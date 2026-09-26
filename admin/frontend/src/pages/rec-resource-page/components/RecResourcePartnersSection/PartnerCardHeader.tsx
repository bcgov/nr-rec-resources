import { Col, Row } from 'react-bootstrap';
import { capitalizeWords } from '@shared/utils/capitalizeWords';
import { CustomBadge } from '@/components';
import { CANCELLED_BADGE, getAgreementStatusBadge } from './partnerStatus';
import './RecResourcePartnersContent.scss';

interface PartnerCardHeaderProps {
  clientNumber?: string;
  clientName?: string;
  /** The read-only card reads this off the partner, the edit card off its draft. */
  agreementEndDate?: string | null;
  cancelled?: boolean;
  className?: string;
}

/**
 * Identity line plus status pills, shared by the read-only and edit cards so
 * the two can't drift apart.
 */
export const PartnerCardHeader = ({
  clientNumber,
  clientName,
  agreementEndDate,
  cancelled,
  className = 'align-items-center mb-3',
}: PartnerCardHeaderProps) => {
  const statusBadge = getAgreementStatusBadge(agreementEndDate, cancelled);

  return (
    <Row className={className}>
      <Col xs={12} md={7}>
        <span className="partner-panel__client-id">{clientNumber}</span>{' '}
        <span className="partner-panel__client-name">
          {clientName && capitalizeWords(clientName)}
        </span>
      </Col>
      <Col xs={12} md={5} className="text-md-end mt-2 mt-md-0">
        <CustomBadge
          label={statusBadge.label}
          bgColor={statusBadge.bgColor}
          textColor={statusBadge.textColor}
        />
        {cancelled && (
          <span className="ms-2">
            <CustomBadge
              label={CANCELLED_BADGE.label}
              bgColor={CANCELLED_BADGE.bgColor}
              textColor={CANCELLED_BADGE.textColor}
            />
          </span>
        )}
      </Col>
    </Row>
  );
};
