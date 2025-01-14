import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiService from '@/service/api-service';
import type { AxiosResponse } from '~/axios';
import buildQueryString from '@/utils/buildQueryString';
import RecResourceCard from '@/components/Search/RecResourceCard';
import SearchBanner from '@/components/Search/SearchBanner';

import { photosExample } from '@/components/RecResource/RecResourcePage';

const SearchPage = () => {
  const [recResourceData, setRecResourceData] = useState<any>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResetKey, setSearchResetKey] = useState('');
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const [isLazyLoading, setIsLazyLoading] = useState(false);

  const recResourceList = recResourceData?.data;
  const recResourceCount = recResourceData?.total;
  const page = searchParams.get('page');

  const isResults = recResourceList?.length > 0;
  const isLoadMore = isResults && recResourceCount > recResourceList?.length;

  const isFilters =
    Object.keys(Object.fromEntries(searchParams.entries())).length > 0;

  const handleLoadMore = () => {
    setIsLazyLoading(true);
    const updatedPage = (page ? parseInt(page) + 1 : 2).toString();
    setSearchParams({ ...searchParams, page: updatedPage });
  };

  const handleClearFilters = () => {
    setSearchParams({});
    setSearchResetKey(crypto.randomUUID());
  };

  useEffect(() => {
    if (!isFilters && !isComponentMounted) {
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
    } else {
      setIsComponentMounted(true);
    }

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (isComponentMounted || isFilters) {
      const params = Object.fromEntries(searchParams.entries());

      if (!isComponentMounted) {
        if (page && parseInt(page) > 10) {
          // Reset page to 10 if user navigates back to search page since api only supports up to 10 pages simultaneously
          // Lazy loading works past page 10 since we pass a limit and fetch 10 at a time
          params.page = '10';
          // Use shallow routing so we don't trigger use effect again
          window.history.replaceState(null, '', buildQueryString(params));
        }
      }
      // Fetch recreation resources if filter changes
      const queryString = buildQueryString(params);
      apiService
        .getAxiosInstance()
        .get(
          `/v1/recreation-resource/search${queryString}${isLazyLoading ? '&limit=10' : ''}`,
        )
        .then((response: AxiosResponse) => {
          if (isLazyLoading) {
            // Append paginated data to existing data
            setRecResourceData({
              data: [...recResourceList, ...response.data.data],
              total: response.data.total,
            });
          } else {
            setRecResourceData(response.data);
          }
          setIsLazyLoading(false);
          return response;
        })
        .catch((error) => {
          console.error(error);
        });
    }

    // Don't want all dependencies to trigger this
    // eslint-disable-next-line
  }, [searchParams]);

  return (
    <>
      <SearchBanner key={searchResetKey} />
      <div className="page-container bg-brown-light">
        <div className="page page-padding">
          <section className="search-results-count">
            <div>
              {recResourceCount ? (
                <>
                  <b>{recResourceCount}</b>{' '}
                  {recResourceCount === 1 ? 'Result' : 'Results'}
                </>
              ) : (
                <span>No results found</span>
              )}
            </div>
            {isFilters && (
              <button
                type="button"
                className="btn-link"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
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
