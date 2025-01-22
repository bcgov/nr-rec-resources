import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleChevronRight } from '@fortawesome/free-solid-svg-icons';
import Activities from '@/components/rec-resource/card/Activities';
import CardCarousel from '@/components/rec-resource/card/CardCarousel';
import Status from '@/components/rec-resource/Status';
import { Activity } from '@/components/rec-resource/types';
import '@/components/rec-resource/card/RecResourceCard.scss';

interface RecResourceCardProps {
  recId: string;
  activities: Activity[];
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
              {name?.toLowerCase()}{' '}
              <FontAwesomeIcon
                icon={faCircleChevronRight}
                className="card-heading-icon"
              />
            </h2>
          </a>
          <p className="capitalize">{siteLocation?.toLowerCase()}</p>
        </div>
        <div className="card-content-lower">
          {isActivities ? <Activities activities={activities} /> : <div />}
          <Status />
        </div>
      </div>
    </div>
  );
};

export default RecResourceCard;
