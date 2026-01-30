import { FC, ReactNode } from 'react';
import { Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import './FormLabel.scss';

interface FormLabelProps {
  children: ReactNode;
  required?: boolean;
  public?: boolean;
  className?: string;
}

export const FormLabel: FC<FormLabelProps> = ({
  children,
  required = false,
  public: isPublic = false,
  className,
}) => (
  <Form.Label className={className}>
    {children}
    {required && (
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id="required-tooltip">This is a required field</Tooltip>
        }
      >
        <span className="form-label__required">*</span>
      </OverlayTrigger>
    )}
    {isPublic && (
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id="public-tooltip">
            This field will appear on the public site
          </Tooltip>
        }
      >
        <span className="form-label__public-badge">Public</span>
      </OverlayTrigger>
    )}
  </Form.Label>
);
