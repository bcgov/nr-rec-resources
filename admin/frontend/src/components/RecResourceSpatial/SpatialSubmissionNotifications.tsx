import { useEffect } from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCircleExclamation } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert } from 'react-bootstrap';
import type { CreateStatus } from './SpatialSubmissionSection.types';
import type { ValidationIssue } from './spatialSubmissionUtils';

type SpatialSubmissionAlertsProps =
  | {
      kind: 'notifications';
      hasValidationSuccessNotice: boolean;
      showValidationSuccessNotice: boolean;
      onDismissValidationSuccessNotice: () => void;
      createStatus: CreateStatus | null;
      onDismissCreateStatus: () => void;
      areDistrictOptionsErrored: boolean;
      showDistrictOptionsNotice: boolean;
      onDismissDistrictOptionsNotice: () => void;
    }
  | {
      kind: 'validation';
      issues: ValidationIssue[];
      hasValidationErrors: boolean;
    };

export const SpatialSubmissionAlerts = (
  props: SpatialSubmissionAlertsProps,
) => {
  const dismissValidationSuccessNotice =
    props.kind === 'notifications'
      ? props.onDismissValidationSuccessNotice
      : undefined;

  const shouldAutoDismissValidationSuccess =
    props.kind === 'notifications' &&
    props.hasValidationSuccessNotice &&
    props.showValidationSuccessNotice;

  useEffect(() => {
    if (
      !shouldAutoDismissValidationSuccess ||
      !dismissValidationSuccessNotice
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      dismissValidationSuccessNotice();
    }, 5000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [shouldAutoDismissValidationSuccess, dismissValidationSuccessNotice]);

  if (props.kind === 'validation') {
    if (!props.issues.length) {
      return null;
    }

    return (
      <Alert
        className={`mt-3 mb-0 spatial-submission-section__validation-alert spatial-submission-section__validation-alert--${props.hasValidationErrors ? 'danger' : 'warning'}`}
        variant="light"
      >
        <FontAwesomeIcon
          icon={faCircleExclamation as IconProp}
          aria-hidden="true"
          className="spatial-submission-section__validation-alert-icon"
        />
        <div className="spatial-submission-section__validation-alert-content">
          <strong className="spatial-submission-section__validation-alert-title">
            Validation Results
          </strong>
          <ul className="spatial-submission-section__validation-alert-list">
            {props.issues.map((issue, idx) => (
              <li key={`${issue.type}-${idx}`}>
                [{issue.type}] {issue.message}
              </li>
            ))}
          </ul>
        </div>
      </Alert>
    );
  }

  const shouldShowContainer =
    props.hasValidationSuccessNotice ||
    Boolean(props.createStatus) ||
    (props.areDistrictOptionsErrored && props.showDistrictOptionsNotice);

  if (!shouldShowContainer) {
    return null;
  }

  return (
    <div className="spatial-submission-section__notifications">
      {props.hasValidationSuccessNotice &&
        props.showValidationSuccessNotice && (
          <Alert
            variant="success"
            dismissible
            onClose={props.onDismissValidationSuccessNotice}
            className="mb-2"
          >
            Spatial file validated successfully.
          </Alert>
        )}

      {props.createStatus && (
        <Alert
          variant={props.createStatus.variant}
          dismissible
          onClose={props.onDismissCreateStatus}
          className="mb-2"
        >
          {props.createStatus.message}
        </Alert>
      )}

      {props.areDistrictOptionsErrored && props.showDistrictOptionsNotice ? (
        <Alert
          variant="warning"
          dismissible
          onClose={props.onDismissDistrictOptionsNotice}
          className="mb-0"
        >
          Unable to load district/type options. Please refresh and try again.
        </Alert>
      ) : null}
    </div>
  );
};
