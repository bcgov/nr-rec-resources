import { FC } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Control, Controller } from 'react-hook-form';
import {
  ImageUploadFormData,
  UploadState,
} from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/schemas';
import { BC_GOV_PERSONAL_INFORMATION_URL } from '@/constants/urls';
import './ImageUploadForm.scss';

interface ImageUploadFormProps {
  control: Control<ImageUploadFormData>;
  uploadState: UploadState;
}

export const ImageUploadForm: FC<ImageUploadFormProps> = ({
  control,
  uploadState,
}) => {
  const isToggle2Disabled = uploadState === 'not-working-hours';

  return (
    <Form className="image-upload-form">
      <h4>Details</h4>
      {/* Display Name */}
      <Form.Group className="mb-4">
        <Form.Label>Display name (public label)</Form.Label>
        <Controller
          name="displayName"
          control={control}
          render={({ field, fieldState }) => (
            <>
              <Form.Control
                {...field}
                type="text"
                maxLength={50}
                placeholder="Enter a display name"
                isInvalid={!!fieldState.error}
              />
              <Form.Text className="text-muted">
                Briefly describe the location or feature
              </Form.Text>
              <Form.Control.Feedback type="invalid">
                {fieldState.error?.message}
              </Form.Control.Feedback>
            </>
          )}
        />
      </Form.Group>
      <h4>Privacy and ownership</h4>
      {/* Toggle 1: Working Hours */}
      <Form.Group className="image-upload-form__toggle-group">
        <Form.Label>
          Was this photo taken by staff during working hours?
        </Form.Label>
        <Controller
          name="takenDuringWorkingHours"
          control={control}
          render={({ field }) => (
            <div className="image-upload-form__radio-group">
              <Form.Check
                inline
                type="radio"
                id="working-hours-yes"
                label="Yes"
                value="yes"
                checked={field.value === 'yes'}
                onChange={() => field.onChange('yes')}
              />
              <Form.Check
                inline
                type="radio"
                id="working-hours-no"
                label="No"
                value="no"
                checked={field.value === 'no'}
                onChange={() => field.onChange('no')}
              />
            </div>
          )}
        />
      </Form.Group>
      {/* Warning: Not working hours */}
      {uploadState === 'not-working-hours' && (
        <Alert variant="warning">
          RecSpace is currently accepting photos only taken during working
          hours. Thank you for your patience as we continue to enhance this
          feature.
        </Alert>
      )}
      {/* Toggle 2: Personal Info */}
      <Form.Group className="my-2 d-flex flex-column">
        <Form.Label className="mb-0">
          Does this photo contain{' '}
          <a
            href={BC_GOV_PERSONAL_INFORMATION_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            personally identifiable information?
          </a>
        </Form.Label>
        <Form.Text className="text-muted mt-0 mb-2">
          Includes faces, vehicle plates, or identifiable details.
        </Form.Text>
        <Controller
          name="containsPersonalInfo"
          control={control}
          render={({ field }) => (
            <div className="image-upload-form__radio-group">
              <Form.Check
                inline
                type="radio"
                id="personal-info-yes"
                label="Yes"
                value="yes"
                checked={field.value === 'yes'}
                onChange={() => field.onChange('yes')}
                disabled={isToggle2Disabled}
              />
              <Form.Check
                inline
                type="radio"
                id="personal-info-no"
                label="No"
                value="no"
                checked={field.value === 'no'}
                onChange={() => field.onChange('no')}
                disabled={isToggle2Disabled}
              />
            </div>
          )}
        />
      </Form.Group>
      {/* Warning: Has Personal Info */}
      {uploadState === 'has-personal-info' && (
        <Alert variant="warning">
          This photo contains personally identifiable information. Thank you for
          your patience as we continue to enhance this feature.
        </Alert>
      )}
      {/* Checkbox: Confirm no Personal Info */}
      {(uploadState === 'confirm-no-personal-info' ||
        uploadState === 'ready') && (
        <Alert className="base-file-modal__alert base-file-modal__alert--info mb-0">
          <Controller
            name="confirmNoPersonalInfo"
            control={control}
            render={({ field }) => (
              <Form.Check
                type="checkbox"
                id="confirm-no-personal-info"
                label="By uploading this photo, I confirm that it contains no personally identifiable information."
                checked={field.value ?? false}
                onChange={field.onChange}
              />
            )}
          />
        </Alert>
      )}
    </Form>
  );
};
