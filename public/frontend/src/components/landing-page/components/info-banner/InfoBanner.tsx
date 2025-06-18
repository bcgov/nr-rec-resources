import campingIcon from '@/images/activities/walk-in-camping.svg';
import './InfoBanner.scss';

const InfoBanner = () => {
  return (
    <div className="info-banner">
      <div className="info-banner-content">
        <img
          src={campingIcon}
          alt="Camping icon"
          className="info-banner-icon-lg d-none d-sm-block"
          width={98}
          height={98}
        />
        <div className="flex align-items-center">
          <div className="d-flex align-items-center">
            <img
              src={campingIcon}
              alt="Camping icon"
              className="d-block d-sm-none me-3"
              width={48}
              height={48}
            />
            <h3>Are recreation sites reservable?</h3>
          </div>
          <p>
            Most recreation sites are available on a first-come, first-served
            basis and cannot be booked ahead of time. Check the description
            section of the site if you&lsquo;re interested to get more details
            about fees and reservations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoBanner;
