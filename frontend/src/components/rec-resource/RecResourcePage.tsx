import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import useScrollSpy from 'react-use-scrollspy';
import BreadCrumbs from '@/components/layout/BreadCrumbs';
import {
  Camping,
  Closures,
  Contact,
  MapsAndLocation,
  PhotoGallery,
  SiteDescription,
  ThingsToDo,
} from '@/components/rec-resource';
import Status from '@/components/rec-resource/Status';
import PageMenu from '@/components/layout/PageMenu';
import locationDot from '@/images/fontAwesomeIcons/location-dot.svg';
import '@/components/rec-resource/RecResource.scss';
import { RecreationResourceDto } from '@/service/recreation-resource';
import { useRecreationResourceApi } from '@/service/hooks/useRecreationResourceApi';

export const photosExample = [
  {
    imageUrl:
      'https://www.sitesandtrailsbc.ca/resources/REC5600/siteimages/Lost%20Shoe%201.jpg',
  },
  {
    imageUrl:
      'https://www.sitesandtrailsbc.ca/resources/REC5600/siteimages/Lost%20Shoe%203.jpg',
  },
  {
    imageUrl:
      'https://www.sitesandtrailsbc.ca/resources/REC5600/siteimages/Trail%20Entrance.jpg',
  },
  {
    imageUrl:
      'https://www.sitesandtrailsbc.ca/resources/REC5600/siteimages/Lost%20Shoe%202.jpg',
  },
  {
    imageUrl:
      'https://www.sitesandtrailsbc.ca/resources/REC5600/siteimages/Interpretive%20sign.jpg',
  },
  {
    imageUrl:
      'https://www.sitesandtrailsbc.ca/resources/REC5600/siteimages/Lost%20Shoe.jpg',
  },
];

const RecResourcePage = () => {
  const [recResource, setRecResource] = useState<RecreationResourceDto>();
  const [notFound, setNotFound] = useState<boolean>(false);

  const { id } = useParams();

  const recreationResourceApi = useRecreationResourceApi();

  useEffect(() => {
    // Get a single recreation resource by forest file ID
    if (id) {
      recreationResourceApi
        .getRecreationResourceById({ id })
        .then((response) => {
          setRecResource(response);
          return response;
        })
        .catch((error) => {
          console.error(error);
          setNotFound(true);
        });
    }
    // eslint-disable-next-line
  }, []);

  const {
    recreation_activity,
    description,
    name,
    rec_resource_id,
    rec_resource_type,
    closest_community,
    recreation_campsite,
    recreation_status: {
      status_code: statusCode,
      description: statusDescription,
      comment: statusComment,
    } = {},
    recreation_fee,
  } = recResource || {};

  const formattedName = name?.toLowerCase();

  const closuresRef = useRef<HTMLElement>(null!);
  const siteDescriptionRef = useRef<HTMLElement>(null!);
  const mapLocationRef = useRef<HTMLElement>(null!);
  const campingRef = useRef<HTMLElement>(null!);
  const thingsToDoRef = useRef<HTMLElement>(null!);
  const contactRef = useRef<HTMLElement>(null!);

  const isThingsToDo = recreation_activity && recreation_activity.length > 0;
  const isPhotoGallery = photosExample.length > 0;
  const isClosures = statusComment && formattedName && statusCode === 2;

  const sectionRefs: React.RefObject<HTMLElement>[] = useMemo(
    () =>
      [
        isClosures ? closuresRef : null,
        description ? siteDescriptionRef : null,
        mapLocationRef,
        campingRef,
        isThingsToDo ? thingsToDoRef : null,
        contactRef,
      ].filter((ref) => !!ref),
    [description, isClosures, isThingsToDo],
  );

  const pageSections = useMemo(
    () =>
      [
        isClosures && {
          href: '#closures',
          title: 'Closures',
        },
        description && {
          href: '#site-description',
          title: 'Site Description',
        },
        {
          href: '#maps-and-location',
          title: 'Maps and Location',
        },
        {
          href: '#camping',
          title: 'Camping',
        },
        isThingsToDo && {
          href: '#things-to-do',
          title: 'Things to Do',
        },
        {
          href: '#contact',
          title: 'Contact',
        },
      ]
        .filter((section) => !!section)
        .map((section, i) => ({
          ...section,
          sectionIndex: i,
        })),
    [description, isClosures, isThingsToDo],
  );

  const activeSection = useScrollSpy({
    sectionElementRefs: sectionRefs,
    offsetPx: -100,
  });

  if (notFound) {
    return (
      <div className="page page-padding">
        <h2>Resource not found</h2>
        <p>
          <a href="/">Return to Dashboard</a>
        </p>
      </div>
    );
  }

  return (
    <div className="rec-resource-container">
      <div className={`bg-container ${isPhotoGallery ? 'with-gallery' : ''}`}>
        <div className="page page-padding">
          <BreadCrumbs
            customPaths={[
              { name: 'Find a Recreation Site or Trail', route: 'search' },
            ]}
          />
          <section>
            <div>
              <h1 className="capitalize">{formattedName}</h1>
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
              <Status description={statusDescription} statusCode={statusCode} />
            )}
          </section>
        </div>
      </div>
      <div className="page page-padding">
        {isPhotoGallery && (
          <div className="photo-gallery-container">
            <PhotoGallery photos={photosExample} />
          </div>
        )}
        <div className="row no-gutters">
          <div className="page-menu--desktop">
            <PageMenu
              pageSections={pageSections}
              activeSection={activeSection ?? 0}
              menuStyle="nav"
            />
          </div>
          <div className="rec-content-container">
            {isClosures && (
              <Closures
                comment={statusComment}
                siteName={formattedName}
                ref={closuresRef}
              />
            )}
            {description && (
              <SiteDescription
                description={description}
                ref={siteDescriptionRef}
              />
            )}

            <MapsAndLocation ref={mapLocationRef} />

            <Camping
              ref={campingRef}
              fees={recreation_fee!}
              recreation_campsite={recreation_campsite!}
            />

            {isThingsToDo && (
              <ThingsToDo
                activities={recreation_activity}
                ref={thingsToDoRef}
              />
            )}

            <Contact ref={contactRef} />

            <p>
              <a href="/search">Find another Recreation Site or Trail</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecResourcePage;
