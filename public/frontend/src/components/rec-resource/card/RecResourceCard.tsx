import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleChevronRight } from '@fortawesome/free-solid-svg-icons';
import Activities from '@/components/rec-resource/card/Activities';
import Status from '@/components/rec-resource/Status';
import '@/components/rec-resource/card/RecResourceCard.scss';
import { getImageList } from '@/components/rec-resource/card/helpers';
import { RSTSVGLogo } from '@/components/RSTSVGLogo/RSTSVGLogo';
import CardCarousel from '@/components/rec-resource/card/CardCarousel';
import { RecreationResourceSearchModel } from '@/service/custom-models';
import { MAX_ACTIVITIES_TO_DISPLAY } from '@/components/rec-resource/card/constants';

interface RecResourceCardProps {
  recreationResource: RecreationResourceSearchModel;
}

const RecResourceCard: React.FC<RecResourceCardProps> = ({
  recreationResource,
}) => {
  const {
    rec_resource_id,
    name,
    recreation_activity: activities,
    closest_community,
    recreation_status: { status_code, description: statusDescription },
    rec_resource_type,
  } = recreationResource;

  const imageList = getImageList(recreationResource);
  const hasActivities = activities.length > 0;
  const hasImages = imageList.length > 0;
  const isSeeAllActivities = activities.length > MAX_ACTIVITIES_TO_DISPLAY;

  return (
    <div
      className="rec-resource-card"
      key={rec_resource_id}
      id={rec_resource_id}
    >
      <div className={'card-image-container'}>
        {hasImages ? <CardCarousel imageList={imageList} /> : <RSTSVGLogo />}
      </div>
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

          <div className="d-flex flex-column flex-sm-row align-items-sm-center align-items-start mb-2 mb-sm-0">
            <span className="fs-6 fw-normal capitalize">
              {closest_community.toLowerCase()}
            </span>
            {rec_resource_type && (
              <>
                <span className="fs-5 fw-normal mx-2 d-none d-sm-inline">
                  |
                </span>
                <span className="fs-6 fw-normal fst-italic">
                  {rec_resource_type}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="card-content-lower">
          <span className="card-activities d-flex d-row align-items-end">
            {hasActivities && <Activities activities={activities} />}{' '}
            {isSeeAllActivities && (
              <a href={`/resource/${rec_resource_id}#things-to-do`}>see all</a>
            )}
          </span>
          <Status description={statusDescription} statusCode={status_code} />
        </div>
      </div>
    </div>
  );
};

export default RecResourceCard;
