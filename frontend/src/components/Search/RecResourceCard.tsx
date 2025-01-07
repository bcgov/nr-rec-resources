import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleChevronRight } from '@fortawesome/free-solid-svg-icons';
import CardCarousel from '@/components/Search/CardCarousel';
import blueStatus from '@/images/icons/blue-status.svg';
import '@/styles/components/RecResourceCard.scss';

interface RecResourceCardProps {
  recId: string;
  imageList: { imageUrl: string }[];
  name: string;
  siteLocation: string;
}

const RecResourceCard: React.FC<RecResourceCardProps> = ({
  recId,
  imageList,
  name,
  siteLocation,
}) => {
  return (
    <div className="rec-resource-card" key={recId}>
      <CardCarousel imageList={imageList} />
      <div className="carousel-content">
        <a href={`/resource/${recId}`}>
          <h3 className="card-heading-text">
            {name}{' '}
            <FontAwesomeIcon
              icon={faCircleChevronRight}
              className="card-heading-icon"
            />
          </h3>
        </a>
        <p>{siteLocation}</p>
      </div>
      <div className="status-container">
        <div className="icon-container">
          <img
            alt="Site open status icon"
            src={blueStatus}
            height={24}
            width={24}
          />{' '}
          <span>Open (Placeholder)</span>
        </div>
      </div>
    </div>
  );
};

export default RecResourceCard;
