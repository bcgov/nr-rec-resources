import { Card, Stack } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './VisibleOnPublicSite.scss';
import { HelpIcon } from '@/components';
import { DISPLAY_ON_PUBLIC_SITE_TEXT } from '@/utils/helperText';
import { ToggleGroup } from './ToggleGroup';
import { useState } from 'react';

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
  const [toggleState, setToggleState] = useState(value);
  const handleToggle = () => {
    setToggleState((toggleState) => !toggleState);
    onChange?.(!toggleState);
  };

  return (
    <Card className="visible-on-public-site-card">
      <Card.Body>
        <Stack
          direction="horizontal"
          gap={3}
          className="align-items-center justify-content-between w-100"
          aria-label="Public site visibility control"
        >
          {/* Left side: Icon, text, and help icon */}
          <span className="fw-bold d-flex align-items-center">
            <span>Display on public site</span>
            <HelpIcon text={DISPLAY_ON_PUBLIC_SITE_TEXT} id={''} />
          </span>

          {/* Right side: Pill and optional switch grouped together */}
          <div className="d-flex align-items-center gap-3 mx-3">
            <span
              className={`pill pill__${toggleState ? 'visible' : 'hidden'}`}
            >
              <FontAwesomeIcon
                icon={toggleState ? faEye : faEyeSlash}
                className="me-2"
              />
              {toggleState
                ? `Visible on public site`
                : `Not visible on public site`}
            </span>
          </div>
        </Stack>
        {isEditMode && (
          <div className="mt-2">
            <ToggleGroup value={toggleState} onChange={handleToggle} />
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
