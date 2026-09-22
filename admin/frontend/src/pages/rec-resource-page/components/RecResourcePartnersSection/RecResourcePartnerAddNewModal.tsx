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
    isError: isPartnerInfoError,
    isPending,
    reset: resetPartnerInfo,
  } = useGetPartnerByClientId();
  const {
    mutateAsync: fetchPartnerLocations,
    data: partnerLocations,
    isPending: isLocationsPending,
  } = useGetPartnerLocations();
  const { mutate, isPending: isMutatePending } =
    useCreateRecreationResourceAgreementHolder();
  const [step, setStep] = useState<number>(0);
  const [clientNumber, setClientNumber] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [errors, setErrors] = useState<{
    clientNumber?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  const clearAndCancel = () => {
    setStep(0);
    setClientNumber('');
    setStartDate('');
    setEndDate('');
    setErrors({});
    resetPartnerInfo();
    onCancel();
  };

  const validateDates = () => {
    const newErrors: { startDate?: string; endDate?: string } = {};
    const today = new Date().toISOString().split('T')[0];

    if (!startDate) newErrors.startDate = 'Agreement start date is required.';
    if (!endDate) newErrors.endDate = 'Agreement end date is required.';

    if (endDate && endDate < today) {
      newErrors.endDate = 'End date cannot be earlier than today.';
    }

    if (startDate && endDate && startDate > endDate) {
      newErrors.startDate = 'Start date cannot be after the end date.';
      newErrors.endDate = 'End date cannot be before the start date.';
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleClientNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setClientNumber(value);
    resetPartnerInfo();

    if (errors.clientNumber && value.length === 8) {
      setErrors((prev) => ({ ...prev, clientNumber: undefined }));
    }
  };

  const handleContinue = async () => {
    switch (step) {
      case 0: {
        if (clientNumber.length !== 8) {
          setErrors((prev) => ({
            ...prev,
            clientNumber: 'Client # needs to have 8 characters.',
          }));
          return;
        }
        await fetchPartnerInfo(clientNumber);
        if (!isPartnerInfoError) {
          setStep(step + 1);
        }
        await fetchPartnerLocations(clientNumber);
        break;
      }
      case 1:
        if (!validateDates()) {
          return;
        }
        mutate(
          {
            recResourceId: rec_resource_id,
            partner: {
              clientNumber: clientNumber,
              agreementStartDate: startDate,
              agreementEndDate: endDate,
            },
          },
          {
            onSuccess: () => {
              clearAndCancel();
            },
          },
        );
        break;
    }
  };

  const step0 = (
    <>
      <Row className="gy-3 mt-1">
        <Col xs={12} md={12}>
          <Form.Group controlId="bulk-edit-type">
            <Form.Label>CLIENT #</Form.Label>
            <Form.Control
              type="string"
              className="w-100"
              placeholder="Enter CLIENT #"
              value={clientNumber}
              disabled={step === 1}
              onChange={handleClientNumberChange}
              maxLength={8}
              isInvalid={!!errors.clientNumber}
            />
            <Form.Control.Feedback type="invalid">
              {errors.clientNumber}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </>
  );

  const step1 = (
    <>
      <Row className="align-items-center my-3">
        <Col xs={12}>
          <h5 className="fw-bold">Partner Information</h5>
        </Col>
      </Row>
      <Row className="align-items-center mb-2">
        <Col xs={12}>
          {isPending ? (
            <p>Loading information...</p>
          ) : (
            <div>
              <Row className="align-items-center border-bottom">
                <Col xs={6} className="my-3">
                  <span className="fw-bold">Name</span>
                </Col>
                <Col xs={6}>
                  {capitalizeWords(partnerInfo?.clientName || '') || 'N/A'}
                </Col>
              </Row>
              <Row className="align-items-center border-bottom">
                <Col xs={6} className="my-3">
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
                    <Col xs={6} className="my-3">
                      <span className="fw-bold">Email</span>
                    </Col>
                    <Col xs={6}>
                      {partnerLocations?.[0]?.email
                        ? partnerLocations?.[0]?.email.toLocaleLowerCase()
                        : 'N/A'}
                    </Col>
                  </Row>
                  <Row className="align-items-center border-bottom">
                    <Col xs={6} className="my-3">
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
                    <Col xs={6} className="my-3">
                      <span className="fw-bold">Address</span>
                    </Col>
                    <Col xs={6} className="align-items-start my-3">
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
                  <Row className="align-items-center my-3">
                    <Col xs={12}>
                      <h5 className="fw-bold">Add agreement dates</h5>
                    </Col>
                  </Row>
                  <Form>
                    <Row>
                      <Col md={6}>
                        <Form.Group controlId="startDate">
                          <Form.Label>Agreement start date</Form.Label>
                          <Form.Control
                            className={`${!startDate && 'date-input-placeholder'}`}
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                              setStartDate(e.target.value);
                              setErrors((prev) => ({
                                ...prev,
                                startDate: undefined,
                              }));
                            }}
                            isInvalid={!!errors.startDate}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.startDate}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="endDate">
                          <Form.Label>Agreement end date</Form.Label>
                          <Form.Control
                            className={`${!endDate && 'date-input-placeholder'}`}
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                              setEndDate(e.target.value);
                              setErrors((prev) => ({
                                ...prev,
                                endDate: undefined,
                              }));
                            }}
                            isInvalid={!!errors.endDate}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.endDate}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>
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
        {isPartnerInfoError && (
          <p className="text-danger">
            Error loading partner information. Please check the client number
            and try again.
          </p>
        )}
        {step === 1 && !isPartnerInfoError && step1}
      </Modal.Body>
      <Modal.Footer className="bulk-asset-edit-modal__header__footer">
        {step === 1 && (
          <CustomButton variant="outline-primary" onClick={clearAndCancel}>
            Cancel
          </CustomButton>
        )}
        <CustomButton
          variant="primary"
          disabled={
            isPartnerInfoError ||
            isMutatePending ||
            errors.clientNumber !== undefined
          }
          onClick={handleContinue}
        >
          {step === 0 && 'Next'}
          {step === 1 && 'Add Partner'}
        </CustomButton>
      </Modal.Footer>
    </Modal>
  );
}
