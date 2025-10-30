import { RecreationResourceDetailUIModel } from '@/services';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Col,
  ListGroup,
  Row,
  Stack,
} from 'react-bootstrap';

interface AccessCodeCardProps {
  accessCode: RecreationResourceDetailUIModel['accessCodes'][number];
}

const AccessCodeCard: React.FC<AccessCodeCardProps> = ({ accessCode }) => (
  <Card className="h-100 shadow-sm border-0 bg-light">
    <Card.Header className="p-2">
      <Stack direction="horizontal" gap={2}>
        <Badge bg="primary">{accessCode.code}</Badge>
        <span className="fw-medium" title={accessCode.description}>
          {accessCode.description}
        </span>
      </Stack>
    </Card.Header>

    {accessCode.subAccessCodes.length > 0 && (
      <ListGroup>
        <Stack direction="vertical" gap={2}>
          {accessCode.subAccessCodes.map((subCode) => (
            <ListGroup.Item
              key={subCode.code}
              className="d-flex align-items-center py-2 px-3 border-0 bg-light"
            >
              <Stack direction="horizontal" gap={2}>
                <Badge bg="secondary" text="dark">
                  {subCode.code}
                </Badge>
                <span className="small" title={subCode.description}>
                  {subCode.description}
                </span>
              </Stack>
            </ListGroup.Item>
          ))}
        </Stack>
      </ListGroup>
    )}
  </Card>
);

export const RecreationResourceAccessRow: FC<{
  recResource: RecreationResourceDetailUIModel;
}> = ({ recResource }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!recResource.accessCodes?.length) {
    return '-';
  }

  const groupedAccessCodes = recResource.accessCodes.map((accessCode) => ({
    ...accessCode,
    subAccessCodes: accessCode.subAccessCodes || [],
  }));

  const toggleExpand = () => setIsExpanded(!isExpanded);
  const totalItems = groupedAccessCodes.length;
  const showExpandButton = totalItems > 3;
  const displayItems =
    showExpandButton && !isExpanded
      ? groupedAccessCodes.slice(0, 3)
      : groupedAccessCodes;

  return (
    <div>
      <Row xs={1} md={2} lg={3} className="g-3">
        {displayItems.map((accessCode) => (
          <Col key={accessCode.code}>
            <AccessCodeCard accessCode={accessCode} />
          </Col>
        ))}
      </Row>

      {showExpandButton && (
        <div className="text-center mt-3">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={toggleExpand}
            className="px-4"
          >
            {isExpanded ? (
              <>
                Show Less
                <FontAwesomeIcon icon={faChevronUp} className="ms-2" />
              </>
            ) : (
              <>
                +{totalItems - displayItems.length} More Access Types
                <FontAwesomeIcon icon={faChevronDown} className="ms-2" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
