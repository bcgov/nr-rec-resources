import { useParams } from 'react-router-dom';
import apiService from '@/service/api-service';
import { useEffect, useState } from 'react';
import type { AxiosResponse } from '~/axios';
import styles from './RecResource.module.css';

const RecResource = () => {
  const [recResource, setRecResource] = useState<object>({});
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

  const { description, forest_file_id, name, site_location } = recResource;

  return (
    <div className={styles.container}>
      <section>
        <h2>{name}</h2>
        <div>
          <b>Rec site#</b> {forest_file_id}
        </div>
        <p>
          <b>Site location</b> {site_location}
        </p>
        <p>{description}</p>
      </section>
      <p>
        <a href="/">Return to Dashboard</a>
      </p>
    </div>
  );
};

export default RecResource;
