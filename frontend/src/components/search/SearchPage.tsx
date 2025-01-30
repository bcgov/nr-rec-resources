import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiService from '@/service/api-service';
import type { AxiosResponse } from '~/axios';
import buildQueryString from '@/utils/buildQueryString';
import RecResourceCard from '@/components/rec-resource/card/RecResourceCard';
import SearchBanner from '@/components/search/SearchBanner';
import FilterMenu from '@/components/search/filters/FilterMenu';
import FilterMenuMobile from '@/components/search/filters/FilterMenuMobile';
import { photosExample } from '@/components/rec-resource/RecResourcePage';
import { RecreationResource } from '@/components/rec-resource/types';

const SearchPage = () => {
  const [recResourceData, setRecResourceData] = useState<any>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResetKey, setSearchResetKey] = useState('search-reset-key');
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const [isLazyLoading, setIsLazyLoading] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const recResourceList = recResourceData?.data;
  const resultsTotal = recResourceData?.total;
  const page = searchParams.get('page');

  const isResults = recResourceList?.length > 0;
  const isLoadMore = isResults && resultsTotal > recResourceList?.length;
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

  const handleOpenMobileFilter = () => {
    setIsMobileFilterOpen(true);
  };

  useEffect(() => {
    if (!isFilters && !isComponentMounted) {
      // Fetch initial list of recreation resources
      apiService
        .getAxiosInstance()
        .get('/v1/recreation-resource/search')
        .then((response: AxiosResponse) => {
          console.log(response.data);
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
              ...response.data,
              data: [...recResourceList, ...response.data.data],
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

  const activityFilters = recResourceData.filters?.activities;

  const filterMenuContent = [
    {
      title: 'Activities',
      filters: activityFilters,
      param: 'activities',
    },
  ];

  return (
    <>
      <SearchBanner key={`${searchResetKey}-search-banner`} />
      <div className="page-container bg-brown-light">
        <div className="page page-padding search-container">
          <FilterMenu
            key={`${searchResetKey}-filter-menu-desktop`}
            menuContent={filterMenuContent}
          />
          <FilterMenuMobile
            key={`${searchResetKey}-filter-menu-mobile`}
            menuContent={filterMenuContent}
            isOpen={isMobileFilterOpen}
            setIsOpen={setIsMobileFilterOpen}
            onClearFilters={handleClearFilters}
            totalResults={resultsTotal}
          />
          <div className="search-results-container">
            <button
              aria-label="Open mobile filter menu"
              onClick={handleOpenMobileFilter}
              className="btn btn-secondary show-filters-btn-mobile"
            >
              Filter
            </button>
            <div className="search-results-count">
              <div>
                {resultsTotal ? (
                  <>
                    <b>{resultsTotal}</b>{' '}
                    {resultsTotal === 1 ? 'Result' : 'Results'}
                  </>
                ) : (
                  <span>No results found</span>
                )}
              </div>
              {isFilters && (
                <button
                  type="button"
                  className="btn-link clear-filters-btn-desktop"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
            <section>
              {isResults && (
                <>
                  {recResourceList?.map((resource: RecreationResource) => {
                    const { rec_resource_id } = resource;
                    return (
                      <RecResourceCard
                        key={rec_resource_id}
                        imageList={photosExample}
                        recreationResource={resource}
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
      </div>
    </>
  );
};

export default SearchPage;
