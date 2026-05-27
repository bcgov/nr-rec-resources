import { RecreationResourceDetailDto } from '@/service/recreation-resource/models/RecreationResourceDetailDto';
import RecReservationButton, { ReservationType } from './RecReservationButton';
import campground from '@/images/icons/campground.svg';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '@/components/rec-resource/RecResourceReservation.scss';

export interface RecResourceReservationProps {
  recResource: RecreationResourceDetailDto;
}

// ─── helper-functions ────────────────────────────────────────────────────

const hasCamping = (r: RecreationResourceDetailDto) =>
  Boolean(r.campsite_count) || Boolean(r.overnight_fees?.length);

const hasFacilities = (r: RecreationResourceDetailDto) =>
  Boolean(
    r.recreation_structure?.has_toilet || r.recreation_structure?.has_table,
  );

const hasAdditionalFees = (r: RecreationResourceDetailDto) =>
  Boolean(r.additional_fees?.length);

const hasOperatorReservation = (r: RecreationResourceDetailDto) => {
  const info = r.recreation_resource_reservation_info;
  return Boolean(
    info &&
      (info.reservation_website ||
        info.reservation_email ||
        info.reservation_phone_number),
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Shown when a site operator manages reservations. */
const OperatorReservation: React.FC<{
  recResource: RecreationResourceDetailDto;
}> = ({ recResource }) => {
  const info = recResource.recreation_resource_reservation_info!;

  return (
    <>
      <div className="icon-container mt-4 mb-4">
        <div className="camp-icon-container">
          <img src={campground} alt="Campground icon" height={24} width={24} />
          <div>
            <span>Reservations available through site operator.</span>
            <br />
            <span className="note">
              *Please note that Recreation Sites and Trails do not manage
              reservations
            </span>
          </div>
        </div>
      </div>

      <div>
        {info.reservation_website && (
          <RecReservationButton
            text={info.reservation_website}
            type={ReservationType.LINK}
          />
        )}
        {info.reservation_email && (
          <RecReservationButton
            text={info.reservation_email}
            type={ReservationType.EMAIL}
          />
        )}
        {info.reservation_phone_number && (
          <RecReservationButton
            text={info.reservation_phone_number}
            type={ReservationType.PHONE}
          />
        )}
      </div>
    </>
  );
};

/** "Check camping / additional fees / facilities for more information" link sentence. */
const MoreInfoLinks: React.FC<{
  id: string;
  showCamping: boolean;
  showAdditionalFees: boolean;
  showFacilities: boolean;
}> = ({ id, showCamping, showAdditionalFees, showFacilities }) => {
  if (!showCamping && !showAdditionalFees && !showFacilities) return null;

  const links: React.ReactNode[] = [];

  if (showCamping) {
    links.push(
      <a key="camping" href={`/resource/${id}#camping`}>
        camping
      </a>,
    );
  }
  if (showAdditionalFees) {
    links.push(
      <a key="fees" href={`/resource/${id}#additional-fees`}>
        additional fees
      </a>,
    );
  }
  if (showFacilities) {
    links.push(
      <a key="facilities" href={`/resource/${id}#facilities`}>
        facilities
      </a>,
    );
  }

  return (
    <span>
      Check{' '}
      {links.map((link, i) => (
        <span key={i}>
          {link}
          {i < links.length - 1 && (i === links.length - 2 ? ' and ' : ', ')}
          {i === links.length - 1 ? ' ' : ''}
        </span>
      ))}
      for more information.
    </span>
  );
};

/** First-come-first-served camping block. */
const CampingInfo: React.FC<{ recResource: RecreationResourceDetailDto }> = ({
  recResource,
}) => {
  const showFees =
    hasAdditionalFees(recResource) ||
    Boolean(recResource.overnight_fees?.length);
  const showFacilities = hasFacilities(recResource);

  return (
    <div className="camping-info icon-container mt-4 reservation-icon">
      <div className="camp-icon-container">
        <img src={campground} alt="Campground icon" height={24} width={24} />
        <div>
          <span>This site is first come first served.</span>
          {!showFees && (
            <>
              {' '}
              <span>No fees apply.</span>
            </>
          )}
          <br />
          {showFees && (
            <>
              <span>Fees apply when arriving on site.</span> <br />
            </>
          )}
          <MoreInfoLinks
            id={recResource.rec_resource_id}
            showCamping={showFees || showFacilities}
            showAdditionalFees={hasAdditionalFees(recResource)}
            showFacilities={showFacilities}
          />
        </div>
      </div>
    </div>
  );
};

/** Non-camping day-use block (no campsites). */
const DayUseInfo: React.FC<{ recResource: RecreationResourceDetailDto }> = ({
  recResource,
}) => {
  const showFees = hasAdditionalFees(recResource);
  const showFacilities = hasFacilities(recResource);
  const hasDetails = showFees || showFacilities;

  return (
    <div className="camping-info icon-container mt-4 reservation-icon">
      <div className="camp-icon-container">
        <FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
      </div>
      <div>
        {hasDetails ? (
          <>
            <span>
              {showFees ? 'Fees apply when arriving on site.' : 'No fees apply'}
            </span>
            <br />
            <MoreInfoLinks
              id={recResource.rec_resource_id}
              showCamping={false}
              showAdditionalFees={showFees}
              showFacilities={showFacilities}
            />
          </>
        ) : (
          <span>No fees apply</span>
        )}
      </div>
    </div>
  );
};

// ─── Root component ───────────────────────────────────────────────────────────

const RecResourceReservation: React.FC<RecResourceReservationProps> = ({
  recResource,
}) => {
  if (hasOperatorReservation(recResource)) {
    return <OperatorReservation recResource={recResource} />;
  }

  return hasCamping(recResource) ? (
    <CampingInfo recResource={recResource} />
  ) : (
    <DayUseInfo recResource={recResource} />
  );
};

export default RecResourceReservation;
