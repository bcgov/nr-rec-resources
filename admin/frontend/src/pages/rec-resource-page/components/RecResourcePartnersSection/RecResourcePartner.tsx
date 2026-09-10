import { Button, Col, Row } from 'react-bootstrap';
import { capitalizeWords } from '@shared/utils/capitalizeWords';
import { CustomBadge } from '@/components';
import { COLOR_GREEN_DARKER, COLOR_GREEN_LIGHTEST } from '@/styles/colors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faCalendar,
  faChevronUp,
  faChevronDown,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import { useGetPartnerLocations } from '@/services/hooks/recreation-resource-admin/useGetPartnerLocationsByClientId';
import { useState } from 'react';
import { AgreementHolderClientPublicViewDto } from '@/services/recreation-resource-admin/models/AgreementHolderClientPublicViewDto';
import { CopyButton } from '@shared/components/copy-button';

interface RecResourcePartnerProps {
  partner: AgreementHolderClientPublicViewDto;
}

export const RecResourcePartner = ({ partner }: RecResourcePartnerProps) => {
  const {
    mutateAsync: fetchLocations,
    data: locations,
    isPending,
  } = useGetPartnerLocations();
  const [isExpanded, setIsExpanded] = useState(false);

  const togglePartnerDetails = (clientNumber: string) => async () => {
    setIsExpanded((prev) => !prev);
    if (!isExpanded && !locations) {
      await fetchLocations(clientNumber);
    }
  };

  return (
    <div key={partner.clientNumber} className="partner-panel">
      <Row className="align-items-center mb-2">
        <Col xs={10}>
          <span className="fw-bold">{partner.clientNumber}</span>{' '}
          <span>
            {partner.clientName && capitalizeWords(partner.clientName)}
          </span>
        </Col>
        <Col xs={2} className="text-end">
          <CustomBadge
            label={partner.clientStatusDescription || ''}
            bgColor={COLOR_GREEN_LIGHTEST}
            textColor={COLOR_GREEN_DARKER}
          />
        </Col>
      </Row>
      <Row className="align-items-center mb-3">
        <Col xs={12}>
          <span className="badge rounded-pill bg-primary">
            {partner.clientTypeDescription}
          </span>
        </Col>
      </Row>
      <Row className="align-items-center mb-3">
        <Col xs={4}>
          <FontAwesomeIcon icon={faCalendar as any} className="me-2" />
          <span className="fw-bold">Start date</span>{' '}
          <span>
            {partner.agreementStartDate &&
              new Date(partner.agreementStartDate).toLocaleDateString()}
          </span>
        </Col>
        <Col xs={4}>
          <FontAwesomeIcon icon={faCalendar as any} className="me-2" />
          <span className="fw-bold">End date</span>{' '}
          <span>
            {partner.agreementEndDate &&
              new Date(partner.agreementEndDate).toLocaleDateString()}
          </span>
        </Col>
        <Col xs={4}>
          <FontAwesomeIcon icon={faEye as any} className="me-2" />
          <span className="fw-bold">Website</span> <span>Visible</span>
        </Col>
      </Row>
      <Row className="align-items-center mb-2">
        <Col xs={12}>
          <Button
            variant="text"
            onClick={togglePartnerDetails(partner.clientNumber || '')}
            className="toggle-all-button"
          >
            {isExpanded ? 'Hide' : 'Show'} additional information
            <FontAwesomeIcon
              className="toggle-all-arrow"
              icon={(isExpanded ? faChevronUp : faChevronDown) as any}
            />
          </Button>
        </Col>
      </Row>
      {isExpanded && (
        <>
          <Row className="align-items-center mb-2">
            <Col xs={12}>
              <FontAwesomeIcon icon={faEyeSlash as any} className="me-2" />{' '}
              <span className="fw-bold">Contact Information</span>
            </Col>
          </Row>
          <Row className="align-items-center mb-2">
            <Col xs={12}>
              <span>
                This information is referenced from CLIENT. Contact details do
                not show on public website.
              </span>
            </Col>
          </Row>
          <Row className="align-items-center mb-2">
            <Col xs={12}>
              {isPending ? (
                <p>Loading locations...</p>
              ) : (
                locations?.map((loc, index) => (
                  <div
                    className={
                      index < locations.length - 1 ? 'border-bottom' : ''
                    }
                    key={`loc-${loc.clientNumber}-${index}`}
                  >
                    <Row className="align-items-center border-bottom">
                      <Col xs={6} className="my-2">
                        <span className="fw-bold">Email</span>
                      </Col>
                      <Col xs={6}>
                        <CopyButton text={loc.email || ''} />
                      </Col>
                    </Row>
                    <Row className="align-items-center border-bottom">
                      <Col xs={6} className="my-2">
                        <span className="fw-bold">Phone</span>
                      </Col>
                      <Col xs={6}>
                        <CopyButton text={loc.businessPhone || ''} />
                      </Col>
                    </Row>
                    <Row
                      className="align-items-start"
                      key={`loc-${loc.clientNumber}`}
                    >
                      <Col xs={6} className="my-2">
                        <span className="fw-bold">Address</span>
                      </Col>
                      <Col xs={6} className="align-items-start my-2">
                        <CopyButton
                          text={
                            <>
                              <span>
                                {capitalizeWords(loc.address1 || '')},{' '}
                                {capitalizeWords(loc.city || '')}
                              </span>
                              <br />
                              <span>
                                {loc.province}, {loc.postalCode}
                              </span>
                            </>
                          }
                        />
                        <span>
                          {capitalizeWords(loc.address1 || '')},{' '}
                          {capitalizeWords(loc.city || '')}
                        </span>
                        <br />
                        <span>
                          {loc.province}, {loc.postalCode}
                        </span>
                      </Col>
                    </Row>
                  </div>
                ))
              )}
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};
