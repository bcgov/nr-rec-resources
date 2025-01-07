import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiService from '@/service/api-service';
import type { AxiosResponse } from '~/axios';
import RecResourceCard from '@/components/Search/RecResourceCard';
import SearchBanner from '@/components/Search/SearchBanner';

import { photosExample } from '@/components/RecResource/RecResourcePage';

const SearchPage = () => {
  const [recResourceData, setRecResourceData] = useState<any>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isComponentMounted, setIsComponentMounted] = useState(false);

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
      // Fetch initial list of recreation resources
      apiService
        .getAxiosInstance()
        .get('/v1/recreation-resource/search')
        .then((response: AxiosResponse) => {
          setRecResourceData(response.data);
          setIsComponentMounted(true);
          return response;
        })
        .catch((error) => {
          console.error(error);
        });
    }

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (isComponentMounted) {
      // Fetch recreation resources if filter changes
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
  }, [filter, page, isComponentMounted]);

  return (
    <>
      <SearchBanner />
      <div className="page-container bg-brown-light">
        <div className="page page-padding">
          <section className="search-results-count">
            {recResourceCount ? (
              <>
                <b>{recResourceCount}</b>{' '}
                {recResourceCount === 1 ? 'Result' : 'Results'}
              </>
            ) : (
              <p>No results found</p>
            )}
          </section>
          <section>
            {isResults && (
              <>
                {recResourceList?.map((resource: any) => {
                  const { forest_file_id, name, site_location } = resource;
                  return (
                    <RecResourceCard
                      key={forest_file_id}
                      recId={forest_file_id}
                      imageList={photosExample}
                      name={name}
                      siteLocation={site_location}
                    />
                  );
                })}
              </>
            )}{' '}
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
