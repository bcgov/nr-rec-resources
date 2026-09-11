import { Col, Form, Modal, Row } from 'react-bootstrap';
import { CustomButton } from '@/components';
import { useState } from 'react';
import { useGetPartnerByClientId } from '@/services/hooks';
import { useGetPartnerLocations } from '@/services/hooks/recreation-resource-admin/useGetPartnerLocationsByClientId';
import { capitalizeWords } from '@shared/utils/capitalizeWords';
import { formatPhoneNumber } from './helpers';
import { useCreateRecreationResourceAgreementHolder } from '@/services/hooks/recreation-resource-admin/useCreateRecreationResourceAgreementHolder';

interface RecResourcePartnerAddNewModalProps {
  show: boolean;
  rec_resource_id: string;
  onCancel: () => void;
}

export function RecResourcePartnerAddNewModal({
  show,
  rec_resource_id,
  onCancel,
}: RecResourcePartnerAddNewModalProps) {
  const {
    mutateAsync: fetchPartnerInfo,
    data: partnerInfo,
    isPending,
  } = useGetPartnerByClientId();
  const {
    mutateAsync: fetchPartnerLocations,
    data: partnerLocations,
    isPending: isLocationsPending,
  } = useGetPartnerLocations();
  const { mutate } = useCreateRecreationResourceAgreementHolder();
  const [step, setStep] = useState<number>(0);
  const [clientNumber, setClientNumber] = useState<string>('00167392');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const clearAndCancel = () => {
    setStep(0);
    onCancel();
  };

  const handleContinue = async () => {
    switch (step) {
      case 0: {
        setStep(step + 1);
        await fetchPartnerInfo(clientNumber);
        await fetchPartnerLocations(clientNumber);
        break;
      }
      case 1:
        mutate({
          recResourceId: rec_resource_id,
          partner: {
            clientNumber: clientNumber,
            agreementStartDate: startDate,
            agreementEndDate: endDate,
          },
        });
        clearAndCancel();
        break;
    }
  };

  const step0 = (
    <>
      <Row className="gy-3 mt-1">
        <Col xs={12} md={6}>
          <Form.Group controlId="bulk-edit-type">
            <Form.Label>CLIENT #</Form.Label>
            <Form.Control
              type="string"
              placeholder="Enter CLIENT #"
              value={clientNumber}
              disabled={step === 1}
              onChange={(e) => setClientNumber(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  );

  const step1 = (
    <>
      <Row className="align-items-center mb-2">
        <Col xs={12}>
          <span className="fw-bold">Contact Information</span>
        </Col>
      </Row>
      <Row className="align-items-center mb-2">
        <Col xs={12}>
          {isPending ? (
            <p>Loading information...</p>
          ) : (
            <div>
              <Row className="align-items-center border-bottom">
                <Col xs={6} className="my-2">
                  <span className="fw-bold">Name</span>
                </Col>
                <Col xs={6}>
                  {capitalizeWords(partnerInfo?.clientName || '') || 'N/A'}
                </Col>
              </Row>
              <Row className="align-items-center border-bottom">
                <Col xs={6} className="my-2">
                  <span className="fw-bold">Type</span>
                </Col>
                <Col xs={6}>
                  {capitalizeWords(partnerInfo?.clientTypeDescription || '') ||
                    'N/A'}
                </Col>
              </Row>
              {isLocationsPending ? (
                <p>Loading locations...</p>
              ) : (
                <>
                  <Row className="align-items-center border-bottom">
                    <Col xs={6} className="my-2">
                      <span className="fw-bold">Email</span>
                    </Col>
                    <Col xs={6}>{partnerLocations?.[0]?.email || 'N/A'}</Col>
                  </Row>
                  <Row className="align-items-center border-bottom">
                    <Col xs={6} className="my-2">
                      <span className="fw-bold">Phone</span>
                    </Col>
                    <Col xs={6}>
                      {partnerLocations?.[0]?.businessPhone
                        ? formatPhoneNumber(
                            partnerLocations?.[0]?.businessPhone,
                          )
                        : 'N/A'}
                    </Col>
                  </Row>
                  <Row className="align-items-start">
                    <Col xs={6} className="my-2">
                      <span className="fw-bold">Address</span>
                    </Col>
                    <Col xs={6} className="align-items-start my-2">
                      <>
                        <span>
                          {capitalizeWords(
                            partnerLocations?.[0]?.address1 || '',
                          )}
                          {capitalizeWords(partnerLocations?.[0]?.city || '')}
                        </span>
                        <br />
                        <span>
                          {partnerLocations?.[0]?.province},{' '}
                          {partnerLocations?.[0]?.postalCode}
                        </span>
                      </>
                    </Col>
                  </Row>
                  <Row className="align-items-center mb-2">
                    <Col xs={12}>
                      <span className="fw-bold">Add agreement dates</span>
                    </Col>
                  </Row>
                  <Row className="align-items-start">
                    <Col xs={12} md={6}>
                      <Form.Group controlId="agreement-start-date">
                        <Form.Label>Agreement start date</Form.Label>
                        <Form.Control
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group controlId="agreement-end-date">
                        <Form.Label>Agreement end date</Form.Label>
                        <Form.Control
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </>
              )}
            </div>
          )}
        </Col>
      </Row>
    </>
  );

  return (
    <Modal
      show={show}
      onHide={clearAndCancel}
      centered
      className="bulk-asset-edit-modal"
      size="lg"
    >
      <Modal.Header closeButton className="bulk-asset-edit-modal__header">
        <Modal.Title className="bulk-asset-edit-modal__title">
          Add new partner
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bulk-asset-edit-modal__body">
        <h3 className="bulk-asset-edit-modal__subtitle">Partner details</h3>
        {step0}
        {step === 1 && step1}
      </Modal.Body>
      <Modal.Footer className="bulk-asset-edit-modal__header__footer">
        {step === 1 && (
          <CustomButton variant="outline-primary" onClick={clearAndCancel}>
            Cancel
          </CustomButton>
        )}
        <CustomButton variant="primary" onClick={handleContinue}>
          {step === 0 && 'Next'}
          {step === 1 && 'Add Partner'}
        </CustomButton>
      </Modal.Footer>
    </Modal>
  );
}
