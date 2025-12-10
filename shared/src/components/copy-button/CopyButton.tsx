import { FC, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import './CopyButton.scss';

export interface CopyButtonProps {
  text: string;
}

export const CopyButton: FC<CopyButtonProps> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="copy-button">
      <span className="copy-button__text">{text}</span>
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id="copy-tooltip" className="copy-button__tooltip">
            {copied ? 'Copied!' : 'Copy to clipboard'}
          </Tooltip>
        }
      >
        <button
          className="copy-button__button"
          onClick={handleCopy}
          type="button"
          aria-label="Copy to clipboard"
          data-testid="copy-button"
        >
          <FontAwesomeIcon icon={faCopy} />
        </button>
      </OverlayTrigger>
    </div>
  );
};
