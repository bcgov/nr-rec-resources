import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleChevronRight } from '@fortawesome/free-solid-svg-icons';
import Activities from '@/components/RecResource/Activities';
import CardCarousel from '@/components/Search/CardCarousel';
import blueStatus from '@/images/icons/blue-status.svg';
import '@/styles/components/RecResourceCard.scss';

interface RecResourceCardProps {
  recId: string;
  activities: { recreation_activity_code: string }[];
  imageList: { imageUrl: string }[];
  name: string;
  siteLocation: string;
}

const RecResourceCard: React.FC<RecResourceCardProps> = ({
  recId,
  activities,
  imageList,
  name,
  siteLocation,
}) => {
  const isActivities = activities.length > 0;
  return (
    <div className="rec-resource-card" key={recId}>
      <CardCarousel imageList={imageList} />
      <div className="rec-resource-card-content">
        <div className="rec-resource-card-info">
          <a href={`/resource/${recId}`}>
            <h2 className="card-heading-text">
              {name && name.toLowerCase()}{' '}
              <FontAwesomeIcon
                icon={faCircleChevronRight}
                className="card-heading-icon"
              />
            </h2>
          </a>
          <p className="capitalize">
            {siteLocation && siteLocation.toLowerCase()}
          </p>
        </div>
        <div className="card-content-lower">
          {isActivities ? <Activities activities={activities} /> : <div />}
          <div className="card-status-container">
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
    </div>
  );
};

export default RecResourceCard;
