import { Col, ListGroup, Row } from 'react-bootstrap';
import { FC, ReactNode } from 'react';
import { Highlighter } from 'react-bootstrap-typeahead';
import '@shared/components/suggestion-typeahead/SuggestionListItem.scss';

/**
 * Props for the SuggestionListItem component.
 */
interface SearchItemData {
  /** The current search term to highlight in the title. */
  searchTerm: string;
  /** Icon to display for the resource. */
  icon: ReactNode;
  /** Title or name of the resource. */
  title: string;
  /** Type of the recreation resource (e.g.: Recreation site, Recreation trail, etc). */
  resourceType: string;
  /** Closest community where the resource is located (e.g.: Chilliwack, Squamish, etc). */
  community: string;
}

/**
 * Renders a single suggestion item for a recreation resource in the typeahead dropdown.
 * Displays an icon, title (with highlighted search term), resource type, district, and record ID.
 *
 * - On desktop/tablet: shows icon, title, type, district, and record ID badge.
 * - On mobile: shows icon, title, and record ID badge.
 */

export const SuggestionListItem: FC<SearchItemData> = ({
  searchTerm,
  icon,
  title,
  resourceType,
  community,
}) => {
  const lowerCaseTitle = title.toLowerCase();
  const lowerCaseCommunity = community.toLowerCase();
  return (
    <ListGroup.Item action className="suggestion-list-item">
      <Row className="suggestion-list-row">
        <Col xs="auto" className="icon-col">
          <div className="icon-wrapper">{icon}</div>
        </Col>

        <Col className="content-col">
          <span className="rec-name">
            <Highlighter search={searchTerm}>{lowerCaseTitle}</Highlighter>
          </span>
          <div className="description-text">
            {resourceType} &bull;{' '}
            <span className="capitalize">{lowerCaseCommunity}</span>
          </div>
        </Col>
      </Row>
    </ListGroup.Item>
  );
};
