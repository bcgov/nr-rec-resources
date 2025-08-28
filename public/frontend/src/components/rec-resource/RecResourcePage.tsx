import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Breadcrumbs, useBreadcrumbs } from '@shared/components/breadcrumbs';
import PhotoGallery, {
  PhotoGalleryProps,
} from '@/components/rec-resource/PhotoGallery';
import {
  AdditionalFees,
  Camping,
  Closures,
  Contact,
  Facilities,
  MapsAndLocation,
  SiteDescription,
  ThingsToDo,
} from '@/components/rec-resource/section';
import InfoAlert from '@/components/notifications/InfoAlert';
import Status from '@/components/rec-resource/Status';
import {
  PageSection,
  PageWithScrollMenu,
} from '@/components/layout/PageWithScrollMenu';
import locationDot from '@/images/fontAwesomeIcons/location-dot.svg';
import PageTitle from '@/components/layout/PageTitle';
import { ROUTE_TITLES, SITE_TITLE } from '@/routes/constants';
import '@/components/rec-resource/RecResource.scss';
import { SectionIds, SectionTitles } from '@/components/rec-resource/enum';
import {
  useGetRecreationResourceById,
  useGetSiteOperatorById,
} from '@/service/queries/recreation-resource';

const PREVIEW_SIZE_CODE = 'pre';
const FULL_RESOLUTION_SIZE_CODE = 'original';
const RECREATION_SITE = 'Recreation site';

const RecResourcePage = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<PhotoGalleryProps['photos']>([]);

  const { id } = useParams();

  const { data: recResource, error } = useGetRecreationResourceById({
    id,
    imageSizeCodes: [PREVIEW_SIZE_CODE, FULL_RESOLUTION_SIZE_CODE],
  });

  const {
    data: siteOperator,
    isLoading: isOperatorLoading,
    error: operatorError,
    refetch: refetchOperator,
  } = useGetSiteOperatorById({
    id,
  });

  /**
   * Processes recreation resource images to extract the preview and full size image urls
   */
  useEffect(() => {
    if (recResource?.recreation_resource_images) {
      setPhotos(
        recResource.recreation_resource_images.map((imageObj) => {
          const photoObj = {
            caption: imageObj.caption,
            previewUrl: '',
            fullResolutionUrl: '',
          };

          imageObj.recreation_resource_image_variants?.forEach((variant) => {
            if (variant.size_code === PREVIEW_SIZE_CODE) {
              photoObj.previewUrl = variant.url;
            } else if (variant.size_code === FULL_RESOLUTION_SIZE_CODE) {
              photoObj.fullResolutionUrl = variant.url;
            }
          });

          return photoObj;
        }),
      );
    }
  }, [recResource]);

  const {
    additional_fees,
    campsite_count,
    closest_community,
    description,
    driving_directions,
    maintenance_standard_code,
    name,
    rec_resource_id,
    rec_resource_type,
    recreation_access,
    recreation_activity,
    recreation_fee,
    recreation_structure,
    recreation_status: {
      status_code: statusCode,
      description: statusDescription,
      comment: statusComment,
    } = {},
    site_point_geometry,
    recreation_resource_docs,
    spatial_feature_geometry,
  } = recResource || {};

  const formattedName = name
    ?.toLowerCase()
    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

  // Set up breadcrumbs for this resource page
  useBreadcrumbs({
    context: { resourceName: formattedName, resourceId: rec_resource_id },
  });

  const isThingsToDo = recreation_activity && recreation_activity.length > 0;
  const isAccess = recreation_access && recreation_access.length > 0;
  const isCampingAvailable =
    Boolean(campsite_count) || Boolean(recreation_fee?.length);
  const isAdditionalFeesAvailable =
    additional_fees && additional_fees.length > 0;
  const isSiteDescription = description || maintenance_standard_code;
  const isRecreationSite = rec_resource_type === RECREATION_SITE;

  const isFacilitiesAvailable =
    recreation_structure?.has_toilet || recreation_structure?.has_table;
  const isPhotoGallery = photos.length > 0;
  const isClosures = statusComment && formattedName && statusCode === 2;
  const isMapsAndLocation =
    isAccess ||
    site_point_geometry ||
    Boolean(spatial_feature_geometry?.length) ||
    Boolean(recreation_resource_docs?.length) ||
    driving_directions;

  // Create page sections for PageWithScrollMenu
  const pageSections: PageSection[] = [
    {
      id: SectionIds.CLOSURES,
      href: `#${SectionIds.CLOSURES}`,
      title: SectionTitles.CLOSURES,
      isVisible: Boolean(isClosures),
    },
    {
      id: SectionIds.SITE_DESCRIPTION,
      href: `#${SectionIds.SITE_DESCRIPTION}`,
      title: SectionTitles.SITE_DESCRIPTION,
      isVisible: Boolean(isSiteDescription),
    },
    {
      id: SectionIds.MAPS_AND_LOCATION,
      href: `#${SectionIds.MAPS_AND_LOCATION}`,
      title: SectionTitles.MAPS_AND_LOCATION,
      isVisible: Boolean(isMapsAndLocation),
    },
    {
      id: SectionIds.CAMPING,
      href: `#${SectionIds.CAMPING}`,
      title: SectionTitles.CAMPING,
      isVisible: Boolean(isCampingAvailable),
    },
    {
      id: SectionIds.ADDITIONAL_FEES,
      href: `#${SectionIds.ADDITIONAL_FEES}`,
      title: SectionTitles.ADDITIONAL_FEES,
      isVisible: Boolean(isAdditionalFeesAvailable),
    },
    {
      id: SectionIds.THINGS_TO_DO,
      href: `#${SectionIds.THINGS_TO_DO}`,
      title: SectionTitles.THINGS_TO_DO,
      isVisible: Boolean(isThingsToDo),
    },
    {
      id: SectionIds.FACILITIES,
      href: `#${SectionIds.FACILITIES}`,
      title: SectionTitles.FACILITIES,
      isVisible: Boolean(isFacilitiesAvailable),
    },
    {
      id: SectionIds.CONTACT,
      href: `#${SectionIds.CONTACT}`,
      title: SectionTitles.CONTACT,
      isVisible: true,
    },
  ];

  const resourceNotFound = error?.response.status === 404;

  if (resourceNotFound) {
    navigate('/404', {
      replace: true,
    });
  }

  return (
    <>
      <PageTitle
        title={
          formattedName ? ROUTE_TITLES.REC_RESOURCE(formattedName) : SITE_TITLE
        }
      />
      <div className="rec-resource-container">
        <div className={`bg-container ${isPhotoGallery ? 'with-gallery' : ''}`}>
          <div className="page">
            <Breadcrumbs className="mb-4" />
            <section>
              <div>
                <h1>{formattedName}</h1>
                <p className="bc-color-blue-dk mb-4">
                  <span>{rec_resource_type} |</span> {rec_resource_id}
                </p>
              </div>
              <div className="icon-container mb-4">
                <img
                  alt="Location dot icon"
                  src={locationDot}
                  height={24}
                  width={24}
                />{' '}
                <span className="capitalize">
                  {closest_community?.toLowerCase()}
                </span>
              </div>
              {statusCode && statusDescription && (
                <Status
                  description={statusDescription}
                  statusCode={statusCode}
                />
              )}
            </section>
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
              let refIndex = 0; // Track which ref to use for each visible section
              return (
                <div className="rec-content-container">
                  {isRecreationSite && (
                    <InfoAlert>
                      Most recreation sites are available on a first-come,
                      first-served basis and cannot be booked ahead of time. A
                      limited number of fee-based sites may offer reservations,
                      check below for details.
                    </InfoAlert>
                  )}
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

                  {isMapsAndLocation && (
                    <MapsAndLocation
                      accessTypes={recreation_access}
                      recResource={recResource}
                      ref={sectionRefs[refIndex++]}
                    />
                  )}

                  {isCampingAvailable && (
                    <Camping
                      id={SectionIds.CAMPING}
                      ref={sectionRefs[refIndex++]}
                      campsite_count={campsite_count}
                      fees={recreation_fee}
                    />
                  )}

                  {isAdditionalFeesAvailable && (
                    <AdditionalFees
                      id={SectionIds.ADDITIONAL_FEES}
                      ref={sectionRefs[refIndex++]}
                      fees={additional_fees}
                    />
                  )}

                  {isThingsToDo && (
                    <ThingsToDo
                      activities={recreation_activity}
                      ref={sectionRefs[refIndex++]}
                    />
                  )}

                  {isFacilitiesAvailable && (
                    <Facilities
                      recreation_structure={recreation_structure}
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
    </>
  );
};

export default RecResourcePage;
