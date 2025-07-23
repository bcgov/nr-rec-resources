import { Col, ListGroup, Row, Image } from 'react-bootstrap';
import { Highlighter } from 'react-bootstrap-typeahead';
import CURRENT_LOCATION_ICON from '@shared/assets/icons/current_location.svg';
import LOCATION_ICON from '@shared/assets/icons/location.svg';
import { CURRENT_LOCATION_TITLE } from '@/components/recreation-search-form/location-search/LocationSearch';

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
    <ListGroup.Item action className={`d-flex align-items-center`}>
      <Row className="flex-grow-1 align-items-center w-100 g-3">
        {/* Left Section: Icon */}
        <Col
          xs="auto"
          className="d-flex align-items-center justify-content-center"
        >
          <div
            className={`rounded-circle d-flex align-items-center justify-content-center`}
          >
            {isCurrentLocation ? (
              <Image src={CURRENT_LOCATION_ICON} alt="Current location icon" />
            ) : (
              <Image src={LOCATION_ICON} alt="Location icon" />
            )}
          </div>
        </Col>

        {/* Middle Section: Title and Description (desktop/tablet) */}
        <Col className="ms-1 me-auto d-none d-sm-block">
          <span className="rec-name">
            <Highlighter search={searchTerm}>{city}</Highlighter>
          </span>
          <div className="text-muted" style={{ fontSize: '0.9em' }}>
            {isCurrentLocation ? 'Find whats around you' : 'Region'}
          </div>
        </Col>

        {/* Middle Section: Title and Rec ID (mobile) */}
        <Col className="ms-1 me-auto d-block d-sm-none">
          <div className="d-flex flex-column">
            <span className="rec-name mb-1">
              <Highlighter search={searchTerm}>{city}</Highlighter>
            </span>
          </div>
        </Col>
      </Row>
    </ListGroup.Item>
  );
};
