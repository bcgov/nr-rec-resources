import { FC, ReactNode, ReactElement, isValidElement, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import './CopyButton.scss';

export interface CopyButtonProps {
  text: ReactNode;
}

// Helper to extract plain text string from any ReactNode
const extractText = (node: ReactNode): string => {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join('');
  }
  if (isValidElement(node)) {
    // Type assertion to access props.children safely
    const element = node as ReactElement<{ children?: ReactNode }>;
    // Convert <br /> elements into a newline character for clipboard copy
    if (element.type === 'br') {
      return '\n';
    }
    return extractText(element.props.children);
  }
  return '';
};

export const CopyButton: FC<CopyButtonProps> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const plainText = extractText(text);
      await navigator.clipboard.writeText(plainText);
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
          <FontAwesomeIcon icon={faCopy as any} />
        </button>
      </OverlayTrigger>
    </div>
  );
};
