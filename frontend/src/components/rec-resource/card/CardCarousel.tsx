import { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleChevronLeft,
  faCircleChevronRight,
} from '@fortawesome/free-solid-svg-icons';

type ImageList = { imageUrl: string }[];

interface CardCarouselProps {
  imageList: ImageList;
}

const CardCarousel = ({ imageList }: CardCarouselProps) => {
  const [index, setIndex] = useState(0);
  const [isTabFocused, setIsTabFocused] = useState(false);

  const handleSelect = (selectedIndex: number) => {
    setIndex(selectedIndex);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLElement>,
    photos: ImageList,
  ) => {
    if (e.key === 'ArrowRight') {
      setIndex((oldIndex) => (oldIndex + 1) % photos.length);
    } else if (e.key === 'ArrowLeft') {
      setIndex((oldIndex) => (oldIndex - 1 + photos.length) % photos.length);
    }
  };

  return (
    <div className="col-lg-auto carousel-container">
      <Carousel
        fade
        interval={null}
        nextIcon={<FontAwesomeIcon icon={faCircleChevronRight} />}
        prevIcon={<FontAwesomeIcon icon={faCircleChevronLeft} />}
        onSelect={handleSelect}
        activeIndex={index}
        className={`park-carousel tab-focus-${isTabFocused}`}
      >
        {imageList.map((image) => {
          const { imageUrl } = image;
          return (
            <Carousel.Item
              key={imageUrl}
              tabIndex={0}
              onFocus={() => setIsTabFocused(true)}
              onBlur={() => setIsTabFocused(false)}
              onKeyDown={(e) => handleKeyDown(e, imageList)}
              className={'d-flex align-items-center justify-content-center'}
            >
              <img
                alt="rec resource carousel"
                height="200"
                width="250"
                className="carousel-desktop-image"
                src={imageUrl}
              />
              <img
                alt="rec resource carousel"
                className="carousel-mobile-image"
                src={imageUrl}
              />
            </Carousel.Item>
          );
        })}
      </Carousel>
    </div>
  );
};

export default CardCarousel;
