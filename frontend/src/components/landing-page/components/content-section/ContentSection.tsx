import { FC, ReactNode } from 'react';
import { Col, Container, Image, Row } from 'react-bootstrap';
import './ContentSection.scss';

interface ContentSectionProps {
  content: ReactNode;
  image: string;
  imageAlt: string;
  imageFirst?: boolean;
  headingComponent: ReactNode;
}

export const ContentSection: FC<ContentSectionProps> = ({
  content,
  image,
  imageAlt,
  imageFirst = false,
  headingComponent,
}) => {
  const imageOrder = imageFirst ? 'md-1' : 'md-2';
  const contentOrder = imageFirst ? 'md-2' : 'md-1';

  return (
    <section className="content-section">
      <Container>
        <Row className="flex-column flex-md-row align-items-center">
          <Col md={6} className={`order-${imageOrder}`}>
            <Image
              src={image}
              alt={imageAlt}
              fluid
              rounded
              width={500}
              height={300}
            />
          </Col>
          <Col md={6} className={`order-${contentOrder}`}>
            {headingComponent}
            <div className="lh-lg my-4">{content}</div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};
