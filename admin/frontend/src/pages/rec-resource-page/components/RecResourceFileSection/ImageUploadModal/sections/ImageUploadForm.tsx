import { FC, useEffect } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { Controller } from 'react-hook-form';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormLabel } from '@/components';
import {
  BC_GOV_PERSONAL_INFORMATION_URL,
  CONSENT_FORM_URL,
  CONSENT_INFORMATION_URL,
} from '@/constants/urls';
import { ConsentFileUpload } from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/components';
import { useImageUploadForm } from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/hooks';
import { setUploadFileName } from '@/pages/rec-resource-page/store/recResourceFileTransferStore';
import { useGetRecreationResourceOptions } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceOptions';
import './ImageUploadForm.scss';

export interface ImageUploadFormHandlers {
  resetForm: () => void;
  isValid: boolean;
}

interface ImageUploadFormProps {
  fileName: string;
  onUpload: () => void;
  onFormReady: (handlers: ImageUploadFormHandlers) => void;
}

export const ImageUploadForm: FC<ImageUploadFormProps> = ({
  fileName,
  onUpload,
  onFormReady,
}) => {
  const {
    control,
    handleSubmit,
    errors,
    resetForm,
    isUploadEnabled,
    showDateWarning,
    showTakenDuringWorkingHours,
    showNameField,
    showConsentUpload,
    consentFormFile,
    handleConsentFileSelect,
    handleConsentFileRemove,
  } = useImageUploadForm(fileName);

  const { data: photographerTypeOptions } = useGetRecreationResourceOptions([
    'photographerType',
  ]);
  const photographerTypes = photographerTypeOptions?.[0]?.options ?? [];

  useEffect(() => {
    onFormReady({ resetForm, isValid: isUploadEnabled });
  }, [onFormReady, resetForm, isUploadEnabled]);

  const onSubmit = handleSubmit(onUpload);
  return (
    <Form
      className="image-upload-form"
      onSubmit={onSubmit}
      aria-label="image-upload-form"
    >
      <h4>Details</h4>

      {/* Display Name */}
      <Form.Group className="mb-4">
        <FormLabel required public>
          Display name
        </FormLabel>
        <Controller
          name="displayName"
          control={control}
          render={({ field }) => (
            <>
              <Form.Control
                {...field}
                type="text"
                maxLength={50}
                placeholder="Enter a display name"
                isInvalid={!!errors.displayName}
                onChange={(e) => {
                  field.onChange(e);
                  setUploadFileName((e.target as HTMLInputElement).value);
                }}
              />
              <Form.Text className="text-muted">
                Briefly describe the location or feature
              </Form.Text>
              {errors.displayName && (
                <Form.Control.Feedback type="invalid">
                  {errors.displayName.message}
                </Form.Control.Feedback>
              )}
            </>
          )}
        />
      </Form.Group>

      {/* Date Created */}
      <Form.Group className="mb-4">
        <Form.Label>Date taken</Form.Label>
        <Controller
          name="dateCreated"
          control={control}
          render={({ field }) => (
            <>
              <Form.Control
                type="date"
                value={
                  field.value
                    ? new Date(field.value).toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  field.onChange(date);
                }}
                isInvalid={!!errors.dateCreated}
              />
              <Form.Text className="text-muted">Update if inaccurate</Form.Text>
              {errors.dateCreated && (
                <Form.Control.Feedback type="invalid">
                  {errors.dateCreated.message}
                </Form.Control.Feedback>
              )}
              {showDateWarning && (
                <Alert variant="warning" className="mt-2">
                  This date is more than 50 years ago. Please verify it is
                  correct.
                </Alert>
              )}
            </>
          )}
        />
      </Form.Group>

      <h4>Privacy and ownership</h4>

      {/* Photographer Type */}
      <Form.Group className="mb-3">
        <FormLabel required>Photographer type</FormLabel>
        <Controller
          name="photographerType"
          control={control}
          render={({ field }) => (
            <Form.Select
              value={field.value ?? 'STAFF'}
              onChange={(e) => field.onChange(e.target.value)}
            >
              {photographerTypes.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </Form.Select>
          )}
        />
      </Form.Group>

      {/* Was this photo taken during working hours? (Staff only) */}
      {showTakenDuringWorkingHours && (
        <Form.Group className="mb-3">
          <FormLabel required>
            Was this photo taken during working hours?
          </FormLabel>
          <Controller
            name="didYouTakePhoto"
            control={control}
            render={({ field }) => (
              <div className="image-upload-form__radio-group">
                <Form.Check
                  inline
                  type="radio"
                  id="didYouTakePhoto-yes"
                  label="Yes"
                  checked={field.value === true}
                  onChange={() => field.onChange(true)}
                />
                <Form.Check
                  inline
                  type="radio"
                  id="didYouTakePhoto-no"
                  label="No"
                  checked={field.value === false}
                  onChange={() => field.onChange(false)}
                />
              </div>
            )}
          />
          {errors.didYouTakePhoto && (
            <Form.Text className="text-danger">
              {errors.didYouTakePhoto.message}
            </Form.Text>
          )}
        </Form.Group>
      )}

      {/* Photographer Name (shown for non-staff only) */}
      {showNameField && (
        <Form.Group className="mb-3">
          <FormLabel required>
            Provide the name for copyright attribution
          </FormLabel>
          <Controller
            name="photographerName"
            control={control}
            render={({ field }) => (
              <>
                <Form.Control
                  {...field}
                  type="text"
                  placeholder="Enter photographer name"
                  isInvalid={!!errors.photographerName}
                />
                {errors.photographerName && (
                  <Form.Control.Feedback type="invalid">
                    {errors.photographerName.message}
                  </Form.Control.Feedback>
                )}
              </>
            )}
          />
        </Form.Group>
      )}

      {/* Contains identifiable information? */}
      <Form.Group className="mb-3 d-flex flex-column">
        <FormLabel className="mb-0" required>
          Does this photo contain{' '}
          <a
            href={BC_GOV_PERSONAL_INFORMATION_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            personally identifiable information?
          </a>
        </FormLabel>
        <Form.Text className="text-muted mt-0 mb-2">
          Includes faces, license plates, or identifiable details.
        </Form.Text>
        <Controller
          name="containsIdentifiableInfo"
          control={control}
          render={({ field }) => (
            <div className="image-upload-form__radio-group">
              <Form.Check
                inline
                type="radio"
                id="containsIdentifiableInfo-yes"
                label="Yes"
                checked={field.value === true}
                onChange={() => field.onChange(true)}
              />
              <Form.Check
                inline
                type="radio"
                id="containsIdentifiableInfo-no"
                label="No"
                checked={field.value === false}
                onChange={() => field.onChange(false)}
              />
            </div>
          )}
        />
        {errors.containsIdentifiableInfo && (
          <Form.Text className="text-danger">
            {errors.containsIdentifiableInfo.message}
          </Form.Text>
        )}
      </Form.Group>

      {/* Consent form upload (shown when photo contains identifiable info) */}
      {showConsentUpload && (
        <div className="consent-upload-area mb-3">
          <Alert
            variant="danger"
            className="d-flex align-items-start gap-2 text-body"
          >
            <FontAwesomeIcon
              icon={faCircleExclamation}
              className="mt-1 text-danger"
            />
            <div className="w-100">
              <strong>This photo requires a consent and release form.</strong>
              <p className="mb-2">
                Please download the form and ensure the photographer and/or all
                identifiable individuals in the image complete it.{' '}
                <a
                  href={CONSENT_INFORMATION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body text-decoration-underline"
                >
                  Learn more.
                </a>
              </p>
              <Button
                variant="primary"
                className="w-100 text-white"
                href={CONSENT_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download consent and release form
              </Button>
            </div>
          </Alert>

          <ConsentFileUpload
            file={consentFormFile}
            onFileSelect={handleConsentFileSelect}
            onFileRemove={handleConsentFileRemove}
          />
          {errors.consentFormFile && (
            <Form.Text className="text-danger d-block mt-2">
              {errors.consentFormFile.message}
            </Form.Text>
          )}
        </div>
      )}

      {/* Confirmation checkbox */}
      <Alert className="base-file-modal__alert base-file-modal__alert--info mb-0">
        <Controller
          name="confirmationChecked"
          control={control}
          render={({ field }) => (
            <>
              <Form.Check
                type="checkbox"
                id="confirmationChecked"
                label="By uploading this photo, I confirm that it contains no personally identifiable information or that I have obtained the required consent forms, and the image rights belong to Recreation Sites and Trails."
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                isInvalid={!!errors.confirmationChecked}
              />
              {errors.confirmationChecked && (
                <Form.Text className="text-danger">
                  {errors.confirmationChecked.message}
                </Form.Text>
              )}
            </>
          )}
        />
      </Alert>
    </Form>
  );
};
