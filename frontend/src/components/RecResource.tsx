import { useParams } from 'react-router-dom';
import apiService from '@/service/api-service';
import { useEffect, useState } from 'react';
import type { AxiosResponse } from '~/axios';
import styles from './RecResource.module.css';

const RecResource = () => {
  const [recResource, setRecResource] = useState<any>([]);

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
      });
    // eslint-disable-next-line
  }, []);

  const { forest_file_id, name, description } = recResource;

  return (
    <div className={styles.container}>
      <section>
        <h2>{name}</h2>
        <p>
          <b>Rec site#</b> {forest_file_id}
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
