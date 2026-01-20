import { FC } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Control, Controller } from 'react-hook-form';
import {
  ImageUploadFormData,
  UploadState,
} from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/schemas';
import { Badge } from '@/components';
import { BC_GOV_PERSONAL_INFORMATION_URL } from '@/constants/urls';
import { setUploadFileName } from '@/pages/rec-resource-page/store/recResourceFileTransferStore';
import './ImageUploadForm.scss';

interface ImageUploadFormProps {
  control: Control<ImageUploadFormData>;
  uploadState: UploadState;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export const ImageUploadForm: FC<ImageUploadFormProps> = ({
  control,
  uploadState,
  onSubmit,
}) => {
  const isPersonalInfoDisabled = uploadState === 'not-working-hours';
  const showConfirmCheckbox =
    uploadState === 'confirm-no-personal-info' || uploadState === 'ready';

  return (
    <Form
      className="image-upload-form"
      onSubmit={onSubmit}
      aria-label="image-upload-form"
    >
      <h4>Details</h4>
      {/* Display Name */}
      <Form.Group className="mb-4">
        <Form.Label>
          Display name <Badge label="Public" />
        </Form.Label>
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
                onChange={(e) => {
                  field.onChange(e);
                  setUploadFileName((e.target as HTMLInputElement).value);
                }}
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
          RecSpace is currently accepting photos only by staff during working
          hours. Please check back soon as we continue to enhance this feature.
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
                disabled={isPersonalInfoDisabled}
              />
              <Form.Check
                inline
                type="radio"
                id="personal-info-no"
                label="No"
                value="no"
                checked={field.value === 'no'}
                onChange={() => field.onChange('no')}
                disabled={isPersonalInfoDisabled}
              />
            </div>
          )}
        />
      </Form.Group>
      {/* Warning: Has Personal Info */}
      {uploadState === 'has-personal-info' && (
        <Alert variant="warning">
          RecSpace is not currently accepting photos with personally
          identifiable information. Please check back soon as we continue to
          enhance this feature.
        </Alert>
      )}
      {/* Checkbox: Confirm no Personal Info */}
      {showConfirmCheckbox && (
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
