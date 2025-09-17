import { RecreationResourceDetailDto } from '@/service/recreation-resource/models/RecreationResourceDetailDto';
import RecReservationButton, { ReservationType } from './RecReservationButton';
import campground from '@/images/icons/campground.svg';
import '@/components/rec-resource/RecResourceReservation.scss';

export interface RecResourceReservationProps {
  recResource: RecreationResourceDetailDto;
}

const RecResourceReservation: React.FC<RecResourceReservationProps> = ({
  recResource,
}) => {
  const isCampingAvailable =
    Boolean(recResource.campsite_count) ||
    Boolean(recResource.recreation_fee?.length);

  const isFacilitiesAvailable =
    recResource.recreation_structure?.has_toilet ||
    recResource.recreation_structure?.has_table;

  const isAdditionalFeesAvailable =
    recResource.additional_fees !== undefined &&
    recResource.additional_fees.length > 0;

  return (
    <>
      {recResource.recreation_resource_reservation_info ? (
        <>
          <div className="icon-container mt-4 mb-4">
            <img
              src={campground}
              alt="Campground icon"
              height={24}
              width={24}
            />{' '}
            <div>
              <span>This site is reservable through our site operator.</span>{' '}
              <br />
              <span className="note">
                *Please note that Recreation Sites and Trails does not manage
                the reservations.
              </span>
            </div>
          </div>
          <div>
            {recResource.recreation_resource_reservation_info
              .reservation_website && (
              <RecReservationButton
                text={
                  recResource.recreation_resource_reservation_info
                    .reservation_website
                }
                type={ReservationType.LINK}
              />
            )}
            {recResource.recreation_resource_reservation_info
              .reservation_email && (
              <RecReservationButton
                text={
                  recResource.recreation_resource_reservation_info
                    .reservation_email
                }
                type={ReservationType.EMAIL}
              />
            )}
            {recResource.recreation_resource_reservation_info
              .reservation_phone_number && (
              <RecReservationButton
                text={
                  recResource.recreation_resource_reservation_info
                    .reservation_phone_number
                }
                type={ReservationType.PHONE}
              />
            )}
          </div>
        </>
      ) : (
        <div className="camping-info icon-container mt-4">
          <img src={campground} alt="Campground icon" height={24} width={24} />{' '}
          <div>
            <span>This site is first come first served.</span> <br />
            {(isAdditionalFeesAvailable ||
              Boolean(recResource.recreation_fee?.length)) && (
              <>
                <span>Fees apply when arriving on site.</span> <br />
              </>
            )}
            {(isCampingAvailable || isAdditionalFeesAvailable) && (
              <span>
                Check{' '}
                {isCampingAvailable && (
                  <>
                    <a
                      href={`/resource/${recResource.rec_resource_id}#camping`}
                    >
                      camping fees
                    </a>
                    {isAdditionalFeesAvailable &&
                      !isFacilitiesAvailable &&
                      ' and '}
                    {isAdditionalFeesAvailable && isFacilitiesAvailable
                      ? ', '
                      : ' '}
                  </>
                )}
                {isAdditionalFeesAvailable && (
                  <a
                    href={`/resource/${recResource.rec_resource_id}#additional-fees`}
                  >
                    additional fees
                  </a>
                )}{' '}
                {isFacilitiesAvailable && (
                  <>
                    and{' '}
                    <a
                      href={`/resource/${recResource.rec_resource_id}#facilities`}
                    >
                      facilities
                    </a>{' '}
                  </>
                )}
                for more information.
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RecResourceReservation;
