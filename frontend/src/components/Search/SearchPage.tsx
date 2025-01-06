import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiService from '@/service/api-service';
import type { AxiosResponse } from '~/axios';
import RecResourceCard from '@/components/Search/RecResourceCard';
import SearchBanner from '@/components/Search/SearchBanner';

const SearchPage = () => {
  const [recResources, setRecResources] = useState<any>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleLoadMore = () => {
    const page = searchParams.get('page');
    const updatedPage = (page ? parseInt(page) + 1 : 2).toString();
    setSearchParams({ ...searchParams, page: updatedPage });
  };

  const filter = searchParams.get('filter');
  const page = searchParams.get('page');

  useEffect(() => {
    if (!filter) {
      // Get all recreation resources
      apiService
        .getAxiosInstance()
        .get('/v1/recreation-resource/search')
        .then((response: AxiosResponse) => {
          const { data } = response.data;
          setRecResources(data);
          return data;
        })
        .catch((error) => {
          console.error(error);
        });
    }

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (filter || page) {
      // Get recreation resources by filter
      apiService
        .getAxiosInstance()
        .get(
          `/v1/recreation-resource/search?filter=${filter}&page=${page ?? 1}`,
        )
        .then((response: AxiosResponse) => {
          const { data } = response.data;
          setRecResources(data);
          return data;
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [filter, page]);

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
        {isResults && (
          <div className="load-more-container">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleLoadMore}
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default SearchPage;
