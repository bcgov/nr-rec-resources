import { FC, HTMLAttributes, ReactElement, useMemo } from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import './ContentSection.scss';
import { BOOTSTRAP_BREAKPOINTS } from '@/data/breakpoints';
import { IMAGE_SIZES } from '@/components/landing-page/components/content-section/constants';

interface ContentSectionProps extends HTMLAttributes<HTMLElement> {
  sectionContent: ReactElement;
  imageBasePath: string;
  imageAlt: string;
  imageFirst?: boolean;
  headingComponent: ReactElement;
}

export const ContentSection: FC<ContentSectionProps> = ({
  sectionContent,
  imageBasePath,
  imageAlt,
  imageFirst = false,
  headingComponent,
}) => {
  const imageOrderClass = imageFirst ? 'order-lg-1' : 'order-lg-2';
  const contentOrderClass = imageFirst ? 'order-lg-2' : 'order-lg-1';

  // Generate img srcSet like: "hero-sm.webp 576w, hero-md.webp 768w, etc"
  const generateImageSrcSet = useMemo(() => {
    return Object.entries(BOOTSTRAP_BREAKPOINTS)
      .map(([size, width]) => `${imageBasePath}-${size}.webp ${width}w`)
      .join(', ');
  }, [imageBasePath]);

  return (
    <section
      className={`content-section ${imageFirst ? 'image-first' : 'image-last'}`}
      data-testid="content-section"
    >
      <Row className="flex-column flex-lg-row align-items-center">
        <Col
          md={12}
          lg={6}
          className={`image-col ${imageOrderClass} d-flex justify-content-center align-items-center`}
          data-testid="image-column"
        >
          <Image
            srcSet={generateImageSrcSet}
            sizes={IMAGE_SIZES}
            alt={imageAlt}
            fluid
            rounded
            data-testid="content-image"
          />
        </Col>

        <Col
          md={12}
          lg={6}
          className={`content-col ${contentOrderClass}`}
          data-testid="content-column"
        >
          {headingComponent}
          <div className="lh-lg">{sectionContent}</div>
        </Col>
      </Row>
    </section>
  );
};
