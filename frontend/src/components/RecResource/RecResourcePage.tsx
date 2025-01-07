import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import useScrollSpy from 'react-use-scrollspy';
import apiService from '@/service/api-service';
import type { AxiosResponse } from '~/axios';
import BreadCrumbs from '@/components/layout/BreadCrumbs';
import {
  Camping,
  Contact,
  MapsAndLocation,
  PhotoGallery,
  SiteDescription,
  ThingsToDo,
} from '@/components/RecResource';
import PageMenu from '@/components/PageMenu';
import locationDot from '@/images/fontAwesomeIcons/location-dot.svg';
import blueStatus from '@/images/icons/blue-status.svg';
import '@/styles/components/RecResource.scss';

interface RecResourceProps {
  forest_file_id: string;
  name: string;
  description: string;
  site_location: string;
}

export const photosExample = [
  {
    imageUrl:
      'http://www.sitesandtrailsbc.ca/resources/REC5600/siteimages/Lost%20Shoe%201.jpg',
  },
  {
    imageUrl:
      'http://www.sitesandtrailsbc.ca/resources/REC5600/siteimages/Lost%20Shoe%203.jpg',
  },
  {
    imageUrl:
      'http://www.sitesandtrailsbc.ca/resources/REC5600/siteimages/Trail%20Entrance.jpg',
  },
  {
    imageUrl:
      'http://www.sitesandtrailsbc.ca/resources/REC5600/siteimages/Lost%20Shoe%202.jpg',
  },
  {
    imageUrl:
      'http://www.sitesandtrailsbc.ca/resources/REC5600/siteimages/Interpretive%20sign.jpg',
  },
  {
    imageUrl:
      'http://www.sitesandtrailsbc.ca/resources/REC5600/siteimages/Lost%20Shoe.jpg',
  },
];

const RecResourcePage = () => {
  const [recResource, setRecResource] = useState<
    RecResourceProps | undefined
  >();
  const [notFound, setNotFound] = useState<boolean>(false);

  const { id } = useParams();

  useEffect(() => {
    // Get a single recreation resource by forest file ID
    apiService
      .getAxiosInstance()
      .get(`/v1/recreation-resource/${id}`)
      .then((response: AxiosResponse) => {
        setRecResource(response.data);
        return response.data;
      })
      .catch((error) => {
        console.error(error);
        setNotFound(true);
      });
    // eslint-disable-next-line
  }, []);

  const { description, forest_file_id, name, site_location } =
    recResource || {};

  const siteDescriptionRef = useRef<HTMLElement>(null!);
  const mapLocationRef = useRef<HTMLElement>(null!);
  const campingRef = useRef<HTMLElement>(null!);
  const thingsToDoRef = useRef<HTMLElement>(null!);
  const contactRef = useRef<HTMLElement>(null!);

  const sectionRefs: React.RefObject<HTMLElement>[] = [
    siteDescriptionRef,
    mapLocationRef,
    campingRef,
    thingsToDoRef,
    contactRef,
  ];

  const activeSection = useScrollSpy({
    sectionElementRefs: sectionRefs,
    offsetPx: -100,
  });

  if (notFound) {
    return (
      <>
        <h2>Resource not found</h2>
        <p>
          <a href="/">Return to Dashboard</a>
        </p>
      </>
    );
  }

  const isPhotoGallery = photosExample.length > 0;

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
              <h1>{name}</h1>
              <p className="bc-color-blue-dk">
                <span>Recreation site |</span> {forest_file_id}
              </p>
            </div>
            <div className="icon-container">
              <img
                alt="Location dot icon"
                src={locationDot}
                height={24}
                width={24}
              />{' '}
              <span>{site_location}</span>
            </div>
            <div className="icon-container">
              <img
                alt="Site open status icon"
                src={blueStatus}
                height={24}
                width={24}
              />{' '}
              <span>Open (Placeholder)</span>
            </div>
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
              pageSections={[
                {
                  sectionIndex: 0,
                  link: '#site-description',
                  display: 'Site Description',
                  visible: !!description,
                },
                {
                  sectionIndex: 1,
                  link: '#maps-and-location',
                  display: 'Maps and Location',
                  visible: true,
                },
                {
                  sectionIndex: 2,
                  link: '#camping',
                  display: 'Camping',
                  visible: true,
                },
                {
                  sectionIndex: 3,
                  link: '#things-to-do',
                  display: 'Things to Do',
                  visible: true,
                },
                {
                  sectionIndex: 4,
                  link: '#contact',
                  display: 'Contact',
                  visible: true,
                },
              ]}
              activeSection={activeSection ?? 0}
              menuStyle="nav"
            />
          </div>
          <div className="rec-content-container">
            {description && (
              <SiteDescription
                description={description}
                ref={siteDescriptionRef}
              />
            )}

            <MapsAndLocation ref={mapLocationRef} />

            <Camping ref={campingRef} />

            <ThingsToDo ref={thingsToDoRef} />

            <Contact ref={contactRef} />

            <p>
              <a href="/">Return to Dashboard</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecResourcePage;
