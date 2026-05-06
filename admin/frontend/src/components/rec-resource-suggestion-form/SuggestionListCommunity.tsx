import { Col, ListGroup, Row, Image } from 'react-bootstrap';
import { Highlighter } from 'react-bootstrap-typeahead';
import LOCATION_ICON from '@shared/assets/icons/location.svg';
import '@shared/components/suggestion-typeahead/SuggestionListItem.scss';

/**
 * Props for the SuggestionListCommunity component.
 */
interface SearchItemData {
  /** The current search term to highlight in the title */
  searchTerm: string;
  /** Name of the community */
  community: string;
}

/**
 * Renders a single suggestion item for a recreation resource in the typeahead dropdown.
 * Displays an icon, title (with highlighted search term), resource type, district, and record ID.
 *
 * - On desktop/tablet: shows icon, title, type, district, and record ID badge.
 * - On mobile: shows icon, title, and record ID badge.
 */
export const SuggestionListCommunity: React.FC<SearchItemData> = ({
  community,
  searchTerm,
}) => {
  return (
    <ListGroup.Item action className={`suggestion-list-item px-2 py-2`}>
      <Row className="suggestion-list-row">
        <Col xs="auto" className="icon-col flex-shrink-0">
          <div
            className="icon-wrapper"
            style={{ width: '40px', height: '40px' }}
          >
            <Image src={LOCATION_ICON} alt="Location icon" />
          </div>
        </Col>

        <Col className="content-col d-flex flex-column">
          <span>
            <Highlighter search={searchTerm}>{community}</Highlighter>
          </span>
          <div className="description-text">Community</div>
        </Col>
      </Row>
    </ListGroup.Item>
  );
};
