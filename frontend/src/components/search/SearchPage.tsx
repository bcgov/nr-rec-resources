import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import RecResourceCard from '@/components/rec-resource/card/RecResourceCard';
import SearchBanner from '@/components/search/SearchBanner';
import ProgressBar from 'react-bootstrap/ProgressBar';
import FilterMenu from '@/components/search/filters/FilterMenu';
import FilterMenuMobile from '@/components/search/filters/FilterMenuMobile';
import {
  PaginatedRecreationResourceDto,
  RecreationResourceDto,
} from '@/service/recreation-resource';
import { useSearchRecreationResourcesPaginated } from '@/service/queries/recreation-resource';
import { useInitialPageFromSearchParams } from '@/components/search/hooks/useInitialPageFromSearchParams';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResetKey, setSearchResetKey] = useState('search-reset-key');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const initialPage = useInitialPageFromSearchParams();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    hasPreviousPage,
    fetchPreviousPage,
    isFetching,
  } = useSearchRecreationResourcesPaginated({
    limit: 10,
    filter: searchParams.get('filter') ?? undefined,
    district: searchParams.get('district') ?? undefined,
    activities: searchParams.get('activities') ?? undefined,
    access: searchParams.get('access') ?? undefined,
    facilities: searchParams.get('facilities') ?? undefined,
    type: searchParams.get('type') ?? undefined,
    imageSizeCodes: ['llc'],
    page: initialPage,
  });

  const filterMenuContent = data?.filters ?? [];
  const resultsTotal = data?.totalCount ?? 0;
  const isFilters =
    Object.keys(Object.fromEntries(searchParams.entries())).length > 0;

  const handleLoadMore = () => {
    const newSearchParams = {
      ...Object.fromEntries(searchParams),
      page: (Number(data?.currentPage || 1) + 1).toString(),
    };
    setSearchParams(newSearchParams);
    fetchNextPage();
  };

  const handleLoadPrevious = () => {
    fetchPreviousPage();
  };

  const handleClearFilters = () => {
    setSearchParams({});
    setSearchResetKey(crypto.randomUUID());
  };

  const handleOpenMobileFilter = () => {
    setIsMobileFilterOpen(true);
  };

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
              {isFetching ? (
                <div>Searching...</div>
              ) : (
                <div>
                  {resultsTotal ? (
                    <span>
                      <strong>{resultsTotal.toLocaleString()}</strong>
                      {` ${resultsTotal === 1 ? 'Result' : 'Results'}`}
                    </span>
                  ) : (
                    'No results found'
                  )}
                </div>
              )}
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
            {hasPreviousPage && (
              <div className="load-more-container mb-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleLoadPrevious}
                >
                  Load Previous
                </button>
              </div>
            )}
            <section>
              {isFetching ? (
                <ProgressBar animated now={100} className="mb-4" />
              ) : (
                data?.pages?.map((pageData: PaginatedRecreationResourceDto) =>
                  pageData.data.map(
                    (recreationResource: RecreationResourceDto) => (
                      <RecResourceCard
                        key={recreationResource.rec_resource_id}
                        recreationResource={recreationResource}
                      />
                    ),
                  ),
                )
              )}
            </section>
            {hasNextPage && (
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
