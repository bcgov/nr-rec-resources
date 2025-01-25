type PhotoProps = {
  type: 'big' | 'small' | 'blur';
  src: string;
  alt?: string;
};

const Photo: React.FC<PhotoProps> = ({ type, src, alt }) => {
  return (
    <div className={`park-photo park-photo--${type}`}>
      <img src={src} alt={alt ?? ''} className="park-photo__image" />
    </div>
  );
};

export default Photo;
