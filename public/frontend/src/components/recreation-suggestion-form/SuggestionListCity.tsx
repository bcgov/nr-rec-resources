import { Col, ListGroup, Row, Image } from 'react-bootstrap';
import { Highlighter } from 'react-bootstrap-typeahead';
import CURRENT_LOCATION_ICON from '@shared/assets/icons/current_location.svg';
import LOCATION_ICON from '@shared/assets/icons/location.svg';
import { CURRENT_LOCATION_TITLE } from '@/components/recreation-suggestion-form/constants';
import '@shared/components/suggestion-typeahead/SuggestionListItem.scss';

/**
 * Props for the SuggestionListCity component.
 */
interface SearchItemData {
  /** The current search term to highlight in the title */
  searchTerm: string;
  /** Name of the city */
  city: string;
}

/**
 * Renders a single suggestion item for a recreation resource in the typeahead dropdown.
 * Displays an icon, title (with highlighted search term), resource type, district, and record ID.
 *
 * - On desktop/tablet: shows icon, title, type, district, and record ID badge.
 * - On mobile: shows icon, title, and record ID badge.
 */
export const SuggestionListCity: React.FC<SearchItemData> = ({
  city,
  searchTerm,
}) => {
  const isCurrentLocation = city === CURRENT_LOCATION_TITLE;
  return (
    <ListGroup.Item action className="suggestion-list-item">
      <Row className="suggestion-list-row">
        <Col xs="auto" className="icon-col">
          <div className="icon-wrapper">
            {isCurrentLocation ? (
              <Image src={CURRENT_LOCATION_ICON} alt="Current location icon" />
            ) : (
              <Image src={LOCATION_ICON} alt="Location icon" />
            )}
          </div>
        </Col>

        <Col className="content-col">
          <span>
            <Highlighter search={searchTerm}>{city}</Highlighter>
          </span>
          <div className="description-text">
            {isCurrentLocation ? `Find what's around you` : 'Community'}
          </div>
        </Col>
      </Row>
    </ListGroup.Item>
  );
};
