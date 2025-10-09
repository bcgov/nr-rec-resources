import { Stack } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLink } from '@fortawesome/free-solid-svg-icons';

export interface ExternalLinkProps {
  url: string;
  label: string;
  onClick?: () => void;
}

const ExternalLink = ({ url, label, onClick }: ExternalLinkProps) => {
  return (
    <a href={url} rel="noopener noreferrer" target="_blank" onClick={onClick}>
      <Stack direction={'horizontal'} gap={1}>
        {label}
        <FontAwesomeIcon icon={faExternalLink} />
      </Stack>
    </a>
  );
};

export default ExternalLink;
