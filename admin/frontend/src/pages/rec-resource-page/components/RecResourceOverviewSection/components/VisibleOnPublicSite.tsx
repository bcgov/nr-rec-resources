import { Card, Form, Stack } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './VisibleOnPublicSite.scss';

type VisibleOnPublicSiteProps = {
  isEditMode?: boolean;
  value: boolean;
  onChange?: (value: boolean) => void;
};

export const VisibleOnPublicSite = ({
  isEditMode = false,
  value,
  onChange,
}: VisibleOnPublicSiteProps) => {
  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked);
  };

  return (
    <Card className="visible-on-public-site-card border-dark border-2">
      <Card.Body>
        <Stack
          direction="horizontal"
          gap={2}
          className="align-items-start justify-content-between"
          aria-label="Public site visibility control"
        >
          <Stack direction="vertical" gap={2}>
            <span className="fw-bold">
              <FontAwesomeIcon
                icon={value ? faEye : faEyeSlash}
                className="me-2"
              />
              Displayed on public site
            </span>
            <span className={`pill pill__${value ? 'visible' : 'hidden'}`}>
              {value
                ? `Yes - Visible on public site`
                : `No -
              Not visible on public site`}
            </span>
          </Stack>
          {isEditMode && (
            <div>
              <Form.Check
                type="switch"
                id="display-on-public-site-switch"
                checked={value}
                onChange={handleToggle}
                aria-label="Toggle visibility on public site"
                className="cursor-pointer"
              />
            </div>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
};
