import locationDot from '@/images/fontAwesomeIcons/location-dot.svg';
import { districtImageMap } from '@/constants/districtImageMap';
import Status from '@/components/rec-resource/Status';
import RecResourceReservation from './RecResourceReservation';
import { RecreationResourceDetailDto } from '@/service/recreation-resource/models/RecreationResourceDetailDto';

interface RecreationDistrict {
  district_code: string;
  description: string;
}

interface ResourceHeaderProps {
  formattedName: string;
  recResourceType: string;
  recResourceId: string;
  closestCommunity?: string;
  topAdvisoryGrouplabel?: string | null;
  isRecreationSite: boolean;
  recResource: RecreationResourceDetailDto;
  isMd: boolean;
  recreationDistrict?: RecreationDistrict;
  advisoriesCount: number;
}

const ResourceHeader = ({
  formattedName,
  recResourceType,
  recResourceId,
  closestCommunity,
  topAdvisoryGrouplabel,
  isRecreationSite,
  recResource,
  isMd,
  recreationDistrict,
  advisoriesCount,
}: ResourceHeaderProps) => {
  const statusDescription = topAdvisoryGrouplabel ?? 'Open';
  const districtImage =
    recreationDistrict?.district_code &&
    districtImageMap[recreationDistrict.district_code];

  return (
    <section className="header-section">
      <div className="header-content">
        <div>
          <h1>{formattedName}</h1>
          <p className="bc-color-blue-dk mb-4">
            <span>{recResourceType} |</span> {recResourceId}
          </p>
        </div>
        <div className="icon-container mb-4">
          <img
            alt="Location dot icon"
            src={locationDot}
            height={24}
            width={24}
          />{' '}
          <span className="capitalize">{closestCommunity?.toLowerCase()}</span>
        </div>
        <Status
          grouplabel={topAdvisoryGrouplabel}
          description={statusDescription}
          advisoriesCount={advisoriesCount}
        />
        {isRecreationSite && recResource && (
          <RecResourceReservation recResource={recResource} />
        )}
      </div>
      {isMd && districtImage && (
        <div className="district-image-container">
          <img
            alt={`${recreationDistrict?.description} district map`}
            src={districtImage}
            fetchPriority="high"
          />
        </div>
      )}
    </section>
  );
};

export default ResourceHeader;
