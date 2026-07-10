import { Breadcrumbs } from '@shared/components/breadcrumbs';
import PhotoGallery from '@/components/rec-resource/PhotoGallery';
import {
  Closures,
  Contact,
  Facilities,
  MapsAndLocation,
  SiteDescription,
  ThingsToDo,
  AccessibleActivities,
  Fees,
  Camping,
} from '@/components/rec-resource/section';
import { Route } from '@/routes/resource/$id';
import { PageWithScrollMenu } from '@/components/layout/PageWithScrollMenu';
import { BOOTSTRAP_BREAKPOINTS } from '@/constants/breakpoints';
import useMediaQuery from '@/hooks/useMediaQuery';
import '@/components/rec-resource/RecResource.scss';
import { useGetSiteOperatorById } from '@/service/queries/recreation-resource';
import KnowBeforeYouGo from './section/KnowBeforeYouGo';
import ResourceHeader from './ResourceHeader';
import { useRecResourceSections } from '@/hooks/useRecResourceSection';
import { SectionIds } from '@/components/rec-resource/enum';

const RecResourcePage = () => {
  const { recResource } = Route.useLoaderData();

  const {
    data: siteOperator,
    isLoading: isOperatorLoading,
    error: operatorError,
    refetch: refetchOperator,
  } = useGetSiteOperatorById({ id: recResource.rec_resource_id });

  const isMd = useMediaQuery(`(min-width: ${BOOTSTRAP_BREAKPOINTS.md}px)`);

  const {
    formattedName,
    photos,
    uniqueRecreationAccess,
    allActivities,
    statusComment,
    isClosures,
    isSiteDescription,
    showCampingSection,
    isFeesAvailable,
    isThingsToDo,
    isAccessibleActivities,
    isFacilitiesAvailable,
    isMapsAndLocation,
    isRecreationSite,
    isPhotoGallery,
    isReservable,
    isCampingAvailable,
    isAdditionalFeesAvailable,
    pageSections,
  } = useRecResourceSections(recResource);

  const {
    additional_fees,
    campsite_count,
    maintenance_standard_code,
    description,
    rec_resource_id,
    rec_resource_type,
    accessible_recreation_activity,
    overnight_fees,
    trail_use_fees,
    recreation_structure,
    closest_community,
    recreation_district,
  } = recResource;
  const advisories = recResource.advisories ?? null;
  const topAdvisoryGrouplabel =
    recResource.top_access_status_grouplabel ?? null;

  return (
    <div className="rec-resource-container">
      <div className={`bg-container ${isPhotoGallery ? 'with-gallery' : ''}`}>
        <div className="page">
          <Breadcrumbs className="mb-4" />
          <ResourceHeader
            formattedName={formattedName}
            recResourceType={rec_resource_type}
            recResourceId={rec_resource_id}
            closestCommunity={closest_community}
            topAdvisoryGrouplabel={topAdvisoryGrouplabel}
            isRecreationSite={isRecreationSite}
            recResource={recResource}
            isMd={isMd}
            recreationDistrict={recreation_district}
            advisoriesCount={advisories ? advisories.length : 0}
          />
        </div>
      </div>

      <div className="page">
        {isPhotoGallery && (
          <div className="photo-gallery-container">
            <PhotoGallery photos={photos} />
          </div>
        )}

        <PageWithScrollMenu
          sections={pageSections}
          className="rec-resource-main"
        >
          {(sectionRefs) => {
            let refIndex = 0;
            return (
              <div className="rec-content-container">
                {isClosures && (
                  <Closures
                    comment={statusComment}
                    siteName={formattedName}
                    ref={sectionRefs[refIndex++]}
                  />
                )}
                {isSiteDescription && (
                  <SiteDescription
                    description={description}
                    maintenanceCode={maintenance_standard_code}
                    ref={sectionRefs[refIndex++]}
                  />
                )}

                {isRecreationSite && (
                  <KnowBeforeYouGo
                    isReservable={isReservable}
                    isAdditionalFeesAvailable={isAdditionalFeesAvailable}
                    isCampingAvailable={isCampingAvailable}
                    advisories={advisories}
                    ref={sectionRefs[refIndex++]}
                  />
                )}
                {showCampingSection && (
                  <Camping
                    id={SectionIds.CAMPING}
                    campsite_count={campsite_count}
                    ref={sectionRefs[refIndex++]}
                  />
                )}
                {isFeesAvailable && (
                  <Fees
                    id={SectionIds.FEES}
                    ref={sectionRefs[refIndex++]}
                    campsite_count={campsite_count}
                    overnight_fees={overnight_fees}
                    trail_use_fees={trail_use_fees}
                    additional_fees={additional_fees}
                  />
                )}
                {isThingsToDo && (
                  <ThingsToDo
                    activities={allActivities}
                    ref={sectionRefs[refIndex++]}
                  />
                )}
                {isAccessibleActivities && (
                  <AccessibleActivities
                    accessible_recreation_activity={
                      accessible_recreation_activity
                    }
                    ref={sectionRefs[refIndex++]}
                  />
                )}
                {isFacilitiesAvailable && (
                  <Facilities
                    recreation_structure={recreation_structure}
                    ref={sectionRefs[refIndex++]}
                  />
                )}
                {isMapsAndLocation && (
                  <MapsAndLocation
                    accessTypes={uniqueRecreationAccess}
                    recResource={recResource}
                    ref={sectionRefs[refIndex++]}
                  />
                )}
                {rec_resource_id && (
                  <Contact
                    ref={sectionRefs[refIndex++]}
                    error={operatorError}
                    isLoading={isOperatorLoading}
                    siteOperator={siteOperator}
                    refetchData={refetchOperator}
                    rec_resource_id={rec_resource_id}
                  />
                )}
              </div>
            );
          }}
        </PageWithScrollMenu>
      </div>
    </div>
  );
};

export default RecResourcePage;
