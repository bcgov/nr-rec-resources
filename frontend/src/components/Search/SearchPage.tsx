import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiService from '@/service/api-service';
import type { AxiosResponse } from '~/axios';
import RecResourceCard from '@/components/Search/RecResourceCard';
import SearchBanner from '@/components/Search/SearchBanner';

const SearchPage = () => {
  const [recResources, setRecResources] = useState<any>([]);
  const [searchParams] = useSearchParams();

  const filter = searchParams.get('filter');

  useEffect(() => {
    if (!filter) {
      // Get all recreation resources
      apiService
        .getAxiosInstance()
        .get('/v1/recreation-resource')
        .then((response: AxiosResponse) => {
          const recreationResources = [];
          console.log(response.data);
          for (const resource of response.data) {
            recreationResources.push(resource);
          }
          setRecResources(recreationResources);
          return recreationResources;
        })
        .catch((error) => {
          console.error(error);
        });
    }

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (filter) {
      // Get recreation resources by filter
      apiService
        .getAxiosInstance()
        .get(`/v1/recreation-resource/search?filter=${filter}&page=1&limit=10`)
        .then((response: AxiosResponse) => {
          const recreationResources = [];
          const res = response.data;
          for (const resource of res.data) {
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
    }
  }, [filter]);

  const isResults = recResources.length > 0;
  return (
    <>
      <SearchBanner />
      <div className="page page-padding">
        <section>
          {isResults ? (
            <>
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
            </>
          ) : (
            <p>No results found.</p>
          )}
        </section>
      </div>
    </>
  );
};

export default SearchPage;
