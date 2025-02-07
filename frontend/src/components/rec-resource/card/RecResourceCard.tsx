import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleChevronRight } from '@fortawesome/free-solid-svg-icons';
import Activities from '@/components/rec-resource/card/Activities';
import CardCarousel from '@/components/rec-resource/card/CardCarousel';
import Status from '@/components/rec-resource/Status';
import { RecreationResource } from '@/components/rec-resource/types';
import '@/components/rec-resource/card/RecResourceCard.scss';

interface RecResourceCardProps {
  imageList: { imageUrl: string }[];
  recreationResource: RecreationResource;
}

const RecResourceCard: React.FC<RecResourceCardProps> = ({
  imageList,
  recreationResource,
}) => {
  const {
    rec_resource_id,
    name,
    recreation_activity: activities,
    closest_community,
    recreation_status: { status_code, description: statusDescription },
  } = recreationResource;
  const isActivities = activities.length > 0;
  return (
    <div className="rec-resource-card" key={rec_resource_id}>
      <CardCarousel imageList={imageList} />
      <div className="rec-resource-card-content">
        <div className="rec-resource-card-info">
          <a href={`/resource/${rec_resource_id}`}>
            <h2 className="card-heading-text">
              {name?.toLowerCase()}{' '}
              <FontAwesomeIcon
                icon={faCircleChevronRight}
                className="card-heading-icon"
              />
            </h2>
          </a>
          <p className="capitalize">{closest_community?.toLowerCase()}</p>
        </div>
        <div className="card-content-lower">
          {isActivities ? <Activities activities={activities} /> : <div />}
          <Status description={statusDescription} statusCode={status_code} />
        </div>
      </div>
    </div>
  );
};

export default RecResourceCard;
