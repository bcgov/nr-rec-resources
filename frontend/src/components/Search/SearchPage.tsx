import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiService from '@/service/api-service';
import type { AxiosResponse } from '~/axios';
import RecResourceCard from '@/components/Search/RecResourceCard';
import SearchBanner from '@/components/Search/SearchBanner';

const SearchPage = () => {
  const [recResourceData, setRecResourceData] = useState<any>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const recResourceList = recResourceData?.data;
  const recResourceCount = recResourceData?.total;

  const isResults = recResourceList?.length > 0;
  const isLoadMore = isResults && recResourceCount > recResourceList?.length;

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
          setRecResourceData(response.data);
          return response;
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
          `/v1/recreation-resource/search?page=${page ?? 1}${filter ? `&filter=${filter}` : ''}`,
        )
        .then((response: AxiosResponse) => {
          setRecResourceData(response.data);
          return response;
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [filter, page]);

  return (
    <>
      <SearchBanner />
      <div className="page-container bg-brown-light">
        <div className="page page-padding">
          <section>
            {isResults ? (
              <>
                {recResourceList?.map((resource: any) => {
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
          {isLoadMore && (
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
      </div>
    </>
  );
};

export default SearchPage;
