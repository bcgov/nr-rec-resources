import apiService from '@/service/api-service';
import { useEffect, useState } from 'react';
import RecResourceCard from '@/components/Search/RecResourceCard';
import SearchBanner from '@/components/Search/SearchBanner';
import type { AxiosResponse } from '~/axios';

const SearchPage = () => {
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
        return recreationResources;
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <>
      <SearchBanner />
      <div className="page page-padding">
        <section>
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
    </>
  );
};

export default SearchPage;