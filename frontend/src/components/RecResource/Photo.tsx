import { LazyLoadImage } from 'react-lazy-load-image-component';

type PhotoProps = {
  type: 'big' | 'small' | 'blur';
  src: string;
  alt?: string;
};

const Photo: React.FC<PhotoProps> = ({ type, src, alt }) => {
  return (
    <div className={`park-photo park-photo--${type}`}>
      <LazyLoadImage src={src} alt={alt ?? ''} effect="opacity" />
    </div>
  );
};

export default Photo;
