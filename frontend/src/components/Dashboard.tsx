import apiService from '@/service/api-service';
import { useEffect, useState } from 'react';
import RecResourceCard from '@/components/Search/RecResourceCard';
import type { AxiosResponse } from '~/axios';

export default function Dashboard() {
  const [recResources, setRecResources] = useState<any>([]);

  useEffect(() => {
    // Get all recreation resources
    apiService
      .getAxiosInstance()
      .get('/v1/recreation-resource')
      .then((response: AxiosResponse) => {
        const recreationResources = [];
        for (const resource of response.data) {
          const recreationResourceDto = {
            forest_file_id: resource.forest_file_id,
            name: resource.name,
            description: resource.description,
          };
          recreationResources.push(recreationResourceDto);
        }
        setRecResources(recreationResources);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div className="page page-padding">
      <section>
        <h1>Find a Recreation Resource</h1>
        {recResources.map((resource: any) => {
          const { forest_file_id, name, description } = resource;
          return (
            <RecResourceCard
              key={forest_file_id}
              forest_file_id={forest_file_id}
              name={name}
              description={description}
            />
          );
        })}
      </section>
    </div>
  );
}
