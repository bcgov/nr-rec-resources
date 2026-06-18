import { useMemo } from 'react';
import { RecreationResourceDetailDto } from '@/service/recreation-resource/models/RecreationResourceDetailDto';
import RecReservationButton, { ReservationType } from './RecReservationButton';
import campground from '@/images/icons/campground.svg';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '@/components/rec-resource/RecResourceReservation.scss';

export interface RecResourceReservationProps {
  recResource: RecreationResourceDetailDto;
}

enum RenderType {
  OPERATOR_RESERVATION = 'OPERATOR_RESERVATION',
  CAMPING_WITH_FEE = 'CAMPING_WITH_FEE',
  CAMPING_NO_FEES = 'CAMPING_NO_FEES',
  DAYUSE_WITH_FEES = 'DAYUSE_WITH_FEES',
  DAYUSE_NO_FEES = 'DAYUSE_NO_FEES',
}

const hasCamping = (r: RecreationResourceDetailDto) =>
  Boolean(r.campsite_count);

const hasFacilities = (r: RecreationResourceDetailDto) =>
  Boolean(
    r.recreation_structure?.has_toilet || r.recreation_structure?.has_table,
  );

const hasOperatorReservation = (r: RecreationResourceDetailDto) => {
  const info = r.recreation_resource_reservation_info;
  return Boolean(
    info &&
      (info.reservation_website ||
        info.reservation_email ||
        info.reservation_phone_number),
  );
};

// Compute all fees once to avoid redundant checks
const computeFeeFlags = (r: RecreationResourceDetailDto) => {
  const hasAdditionalFees = Boolean(r.additional_fees?.length);
  const hasOvernightFees = Boolean(r.overnight_fees?.length);
  const hasCampingFee = Boolean(
    r.overnight_fees?.some((fee: any) => fee.recreation_fee_sub_code === 'C'),
  );
  const hasTrailUseFee = Boolean(r.trail_use_fees?.length);
  const hasAnyFees = hasOvernightFees || hasTrailUseFee || hasAdditionalFees;

  return {
    hasAdditionalFees,
    hasOvernightFees,
    hasCampingFee,
    hasTrailUseFee,
    hasAnyFees,
  };
};

const getReservationRenderType = (
  r: RecreationResourceDetailDto,
): RenderType => {
  const hasReservationInfo = hasOperatorReservation(r);
  const hasCampsites = hasCamping(r);
  const fees = computeFeeFlags(r);

  // Row 1: Has Reservation Info = Yes → Reservation Info only
  if (hasReservationInfo) {
    return RenderType.OPERATOR_RESERVATION;
  }

  // Row 2: Has Reservation Info = No, Yes (campsites), Yes (overnight fees) → Camping with fees
  if (!hasReservationInfo && hasCampsites && fees.hasCampingFee) {
    return RenderType.CAMPING_WITH_FEE;
  }

  // Row 3: Has Reservation Info = No, Yes (campsites), No overnight fees → Camping no fees
  if (!hasReservationInfo && hasCampsites && !fees.hasOvernightFees) {
    return RenderType.CAMPING_NO_FEES;
  }

  // Row 4: Has Reservation Info = No, No (campsites), Any fees → Day-use with fees
  if (!hasReservationInfo && !hasCampsites && fees.hasAnyFees) {
    return RenderType.DAYUSE_WITH_FEES;
  }

  // Row 5: Has Reservation Info = No, No (campsites), No fees → Day-use no fees
  if (!hasReservationInfo && !hasCampsites && !fees.hasAnyFees) {
    return RenderType.DAYUSE_NO_FEES;
  }

  // Default fallback
  return hasCampsites ? RenderType.CAMPING_WITH_FEE : RenderType.DAYUSE_NO_FEES;
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

/** "Check camping / fees / facilities for more information" link sentence. */
const MoreInfoLinks: React.FC<{
  id: string;
  showCamping: boolean;
  showFees: boolean;
  showFacilities: boolean;
}> = ({ id, showCamping, showFees, showFacilities }) => {
  const linkConfigs = [
    { show: showCamping, name: 'camping', anchor: 'camping' },
    { show: showFees, name: 'fees', anchor: 'fees' },
    { show: showFacilities, name: 'facilities', anchor: 'facilities' },
  ];

  const visibleLinks = linkConfigs.filter((config) => config.show);

  if (visibleLinks.length === 0) return null;

  return (
    <span>
      Check{' '}
      {visibleLinks.map((config, i) => (
        <span key={config.anchor}>
          <a href={`/resource/${id}#${config.anchor}`}>{config.name}</a>
          {i < visibleLinks.length - 1 &&
            (i === visibleLinks.length - 2 ? ' and ' : ', ')}
        </span>
      ))}
      {' for more information.'}
    </span>
  );
};

/** First-come-first-served camping block. */
const CampingInfo: React.FC<{
  recResource: RecreationResourceDetailDto;
  renderType: RenderType;
}> = ({ recResource, renderType }) => {
  const showFacilities = hasFacilities(recResource);
  const showFeesInfo = renderType === RenderType.CAMPING_WITH_FEE;
  const showNoFeesInfo = renderType === RenderType.CAMPING_NO_FEES;

  return (
    <div className="camping-info icon-container mt-4 reservation-icon">
      <div className="camp-icon-container">
        <img src={campground} alt="Campground icon" height={24} width={24} />
        <div>
          <span>This site is first come first served.</span>
          {showNoFeesInfo && (
            <>
              <br />
              <span>No fees apply.</span>
            </>
          )}
          {showFeesInfo && (
            <>
              <br />
              <span>Fees apply when arriving on site.</span>
            </>
          )}
          <br />
          <MoreInfoLinks
            id={recResource.rec_resource_id}
            showCamping={showNoFeesInfo && showFacilities}
            showFees={showFeesInfo}
            showFacilities={showFacilities}
          />
        </div>
      </div>
    </div>
  );
};

/** Non-camping day-use block (no campsites). */
const DayUseInfo: React.FC<{
  recResource: RecreationResourceDetailDto;
  renderType: RenderType;
}> = ({ recResource, renderType }) => {
  const showFacilities = hasFacilities(recResource);
  const showFeesApply = renderType === RenderType.DAYUSE_WITH_FEES;
  const showNoFees = renderType === RenderType.DAYUSE_NO_FEES;

  return (
    <div className="camping-info icon-container mt-4 reservation-icon">
      <div className="camp-icon-container">
        <FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
        <div>
          {showNoFees ? (
            <>
              <span>No fees apply.</span>
              <br />
              {showFacilities && (
                <MoreInfoLinks
                  id={recResource.rec_resource_id}
                  showCamping={false}
                  showFees={false}
                  showFacilities={true}
                />
              )}
            </>
          ) : showFeesApply ? (
            <>
              <span>Fees apply when arriving on site.</span>
              <br />
              <MoreInfoLinks
                id={recResource.rec_resource_id}
                showCamping={false}
                showFees={true}
                showFacilities={showFacilities}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const RecResourceReservation: React.FC<RecResourceReservationProps> = ({
  recResource,
}) => {
  const renderType = useMemo(
    () => getReservationRenderType(recResource),
    [recResource],
  );

  switch (renderType) {
    case RenderType.OPERATOR_RESERVATION:
      return <OperatorReservation recResource={recResource} />;

    case RenderType.CAMPING_WITH_FEE:
    case RenderType.CAMPING_NO_FEES:
      return <CampingInfo recResource={recResource} renderType={renderType} />;

    case RenderType.DAYUSE_WITH_FEES:
    case RenderType.DAYUSE_NO_FEES:
      return <DayUseInfo recResource={recResource} renderType={renderType} />;

    default:
      return <DayUseInfo recResource={recResource} renderType={renderType} />;
  }
};

export default RecResourceReservation;
