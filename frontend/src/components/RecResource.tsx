import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '@/service/api-service';
import type { AxiosResponse } from '~/axios';
import BreadCrumbs from '@/components/layout/BreadCrumbs';
import locationDot from '@/assets/fontAwesomeIcons/location-dot.svg';
import '@/styles/components/RecResource.scss';

interface RecResourceProps {
  forest_file_id: string;
  name: string;
  description: string;
  site_location: string;
}

const RecResource = () => {
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
      })
      .catch((error) => {
        console.error(error);
        setNotFound(true);
      });
    // eslint-disable-next-line
  }, []);

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

  const { description, forest_file_id, name, site_location } =
    recResource || {};

  return (
    <div className="rec-resource-container">
      <div className="bg-container">
        <div className="page page-padding">
          <BreadCrumbs customPathNames={['Find a Recreation Site or Trail']} />
          <section>
            <div>
              <h1>{name}</h1>
              <div className="bc-color-blue-dk">
                <span>Recreation site |</span> {forest_file_id}
              </div>
            </div>
            <div className="icon-container">
              <img alt="Location dot icon" src={locationDot} width={16} />{' '}
              <span>{site_location}</span>
            </div>
          </section>
        </div>
      </div>
      <div className="page page-padding">
        <section>
          <p>{description}</p>
        </section>
        <p>
          <a href="/">Return to Dashboard</a>
        </p>
      </div>
    </div>
  );
};

export default RecResource;
