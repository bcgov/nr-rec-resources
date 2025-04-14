import { FC, ReactElement, useMemo } from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import './ContentSection.scss';
import { BOOTSTRAP_BREAKPOINTS } from '@/data/breakpoints';
import { IMAGE_SIZES } from '@/components/landing-page/components/content-section/constants';

type ContentSectionProps = {
  content: ReactElement;
  imageBasePath: string;
  imageAlt: string;
  imageFirst?: boolean;
  headingComponent: ReactElement;
};

export const ContentSection: FC<ContentSectionProps> = ({
  content,
  imageBasePath,
  imageAlt,
  imageFirst = false,
  headingComponent,
}) => {
  const imageOrder = imageFirst ? 'lg-1' : 'lg-2';
  const contentOrder = imageFirst ? 'lg-2' : 'lg-1';

  // Generate img srcSet like: "hero-sm.webp 576w, hero-md.webp 768w, etc"
  const generateImageSrcSet = useMemo(() => {
    return Object.entries(BOOTSTRAP_BREAKPOINTS)
      .map(([size, width]) => `${imageBasePath}-${size}.webp ${width}w`)
      .join(', ');
  }, [imageBasePath]);

  return (
    <section
      className="content-section"
      data-testid="content-section"
      aria-label="Content section"
    >
      <Row className="flex-column flex-lg-row align-items-center">
        <Col
          md={12}
          lg={6}
          className={`order-${imageOrder} d-flex justify-content-center align-items-center`}
          data-testid="image-column"
        >
          <Image
            srcSet={generateImageSrcSet}
            sizes={IMAGE_SIZES}
            alt={imageAlt}
            fluid
            rounded
            loading="lazy"
            data-testid="content-image"
          />
        </Col>
        <Col
          md={12}
          lg={6}
          className={`order-${contentOrder}`}
          data-testid="content-column"
        >
          {headingComponent}
          <div className="lh-lg">{content}</div>
        </Col>
      </Row>
    </section>
  );
};
