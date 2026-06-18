import { useMemo } from 'react';
import { RecreationResourceImageDto } from '@/service/recreation-resource';
import { PhotoGalleryProps } from '@/components/rec-resource/PhotoGallery';
import { SectionIds, SectionTitles } from '@/components/rec-resource/enum';
import { PageSection } from '@/components/layout/PageWithScrollMenu';
import { capitalizeWords } from '@shared/utils/capitalizeWords';

const RECREATION_SITE = 'Recreation site';

export function useRecResourceSections(recResource: any) {
  const formattedName = capitalizeWords(recResource?.name);

  const photos = useMemo<PhotoGalleryProps['photos']>(
    () =>
      recResource?.recreation_resource_images
        ?.map((imageObj: RecreationResourceImageDto) => ({
          previewUrl: imageObj.url?.pre ?? '',
          fullResolutionUrl: imageObj.url?.original ?? '',
        }))
        .filter((img: any) => img.previewUrl !== '') ?? [],
    [recResource],
  );

  const {
    additional_fees,
    campsite_count,
    description,
    driving_directions,
    maintenance_standard_code,
    rec_resource_type,
    recreation_access,
    recreation_activity,
    accessible_recreation_activity,
    overnight_fees,
    trail_use_fees,
    recreation_structure,
    recreation_status: {
      status_code: statusCode,
      description: statusDescription,
      comment: statusComment,
    } = {},
    site_point_geometry,
    recreation_resource_docs,
    spatial_feature_geometry,
    recreation_resource_reservation_info,
  } = recResource ?? {};

  const uniqueRecreationAccess = recreation_access
    ? ([...new Set(recreation_access)] as string[])
    : undefined;

  const allActivities = [
    ...(recreation_activity ?? []),
    ...(accessible_recreation_activity ?? []),
  ];

  // Access and activities
  const isAccess = Boolean(recreation_access?.length);
  const isThingsToDo = allActivities.length > 0;
  const isAccessibleActivities = Boolean(
    accessible_recreation_activity?.length,
  );

  // Fees
  const isOvernightFeesAvailable = Boolean(overnight_fees?.length);
  const isTrailFeesAvailable = Boolean(trail_use_fees?.length);
  const isAdditionalFeesAvailable = Boolean(additional_fees?.length);
  const isFeesAvailable =
    isOvernightFeesAvailable ||
    isTrailFeesAvailable ||
    isAdditionalFeesAvailable;

  // Camping — show if campsites exist and there is no non-camping fee
  const hasCampingFee = overnight_fees?.some(
    (fee: any) => fee.recreation_fee_sub_code === 'C',
  );
  const isCampingAvailable = Boolean(campsite_count);
  const showCampingSection = isCampingAvailable && !hasCampingFee;

  // Facilities
  const isFacilitiesAvailable = Boolean(
    recreation_structure?.has_toilet || recreation_structure?.has_table,
  );

  // Location and maps
  const isMapsAndLocation = Boolean(
    isAccess ||
      site_point_geometry ||
      spatial_feature_geometry?.length ||
      recreation_resource_docs?.length ||
      driving_directions,
  );

  // Site info
  const isSiteDescription = Boolean(description || maintenance_standard_code);
  const isRecreationSite = rec_resource_type === RECREATION_SITE;
  const isClosures = Boolean(
    statusComment && formattedName && statusCode === 2,
  );

  // Gallery
  const isPhotoGallery = photos.length > 0;

  // Reservation
  const isReservable = !!(
    recreation_resource_reservation_info?.reservation_email ||
    recreation_resource_reservation_info?.reservation_phone_number ||
    recreation_resource_reservation_info?.reservation_website
  );

  const pageSections = useMemo<PageSection[]>(
    () => [
      {
        id: SectionIds.CLOSURES,
        href: `#${SectionIds.CLOSURES}`,
        title: SectionTitles.CLOSURES,
        isVisible: isClosures,
      },
      {
        id: SectionIds.SITE_DESCRIPTION,
        href: `#${SectionIds.SITE_DESCRIPTION}`,
        title: SectionTitles.SITE_DESCRIPTION,
        isVisible: isSiteDescription,
      },
      {
        id: SectionIds.CAMPING,
        href: `#${SectionIds.CAMPING}`,
        title: SectionTitles.CAMPING,
        isVisible: showCampingSection,
      },
      {
        id: SectionIds.FEES,
        href: `#${SectionIds.FEES}`,
        title: SectionTitles.FEES,
        isVisible: isFeesAvailable,
      },
      {
        id: SectionIds.THINGS_TO_DO,
        href: `#${SectionIds.THINGS_TO_DO}`,
        title: SectionTitles.THINGS_TO_DO,
        isVisible: isThingsToDo,
      },
      {
        id: SectionIds.ACCESSIBLE_RECREATION,
        href: `#${SectionIds.ACCESSIBLE_RECREATION}`,
        title: SectionTitles.ACCESSIBLE_RECREATION,
        isVisible: isAccessibleActivities,
      },
      {
        id: SectionIds.FACILITIES,
        href: `#${SectionIds.FACILITIES}`,
        title: SectionTitles.FACILITIES,
        isVisible: isFacilitiesAvailable,
      },
      {
        id: SectionIds.MAPS_AND_LOCATION,
        href: `#${SectionIds.MAPS_AND_LOCATION}`,
        title: SectionTitles.MAPS_AND_LOCATION,
        isVisible: isMapsAndLocation,
      },
      {
        id: SectionIds.KNOW_BEFORE_YOU_GO,
        href: `#${SectionIds.KNOW_BEFORE_YOU_GO}`,
        title: SectionTitles.KNOW_BEFORE_YOU_GO,
        isVisible: isRecreationSite,
      },
      {
        id: SectionIds.CONTACT,
        href: `#${SectionIds.CONTACT}`,
        title: SectionTitles.CONTACT,
        isVisible: true,
      },
    ],
    [
      isClosures,
      isSiteDescription,
      showCampingSection,
      isFeesAvailable,
      isThingsToDo,
      isAccessibleActivities,
      isFacilitiesAvailable,
      isMapsAndLocation,
      isRecreationSite,
    ],
  );

  return {
    formattedName,
    photos,
    uniqueRecreationAccess,
    allActivities,
    statusCode,
    statusDescription,
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
  };
}
