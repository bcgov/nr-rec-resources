import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import RecResourceCard from '@/components/rec-resource/card/RecResourceCard';
import SearchBanner from '@/components/search/SearchBanner';
import FilterMenu from '@/components/search/filters/FilterMenu';
import FilterMenuMobile from '@/components/search/filters/FilterMenuMobile';
import { useSearchRecreationResourcesPaginated } from '@/service/queries/recreation-resource';
import { useInitialPageFromSearchParams } from '@/components/search/hooks/useInitialPageFromSearchParams';
import {
  PaginatedRecreationResourceModel,
  RecreationResourceSearchModel,
} from '@/service/custom-models';
import { ProgressBar, Stack } from 'react-bootstrap';
import { LoadingButton } from '@/components/LoadingButton';

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
    isFetchingNextPage,
    isFetchingPreviousPage,
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

  const isFetchingFirstPage =
    isFetching && !isFetchingPreviousPage && !isFetchingNextPage;

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
          <div className="w-100">
            <button
              aria-label="Open mobile filter menu"
              onClick={handleOpenMobileFilter}
              className="btn btn-secondary show-filters-btn-mobile"
            >
              Filter
            </button>

            <div className="d-flex align-items-center justify-content-between mb-4">
              {isFetchingFirstPage ? (
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
            {isFetching && !isFetchingPreviousPage && !isFetchingNextPage ? (
              <ProgressBar animated now={100} className="mb-4" />
            ) : (
              <Stack gap={3} className="align-items-center">
                {hasPreviousPage && (
                  <LoadingButton
                    onClick={handleLoadPrevious}
                    loading={isFetchingPreviousPage}
                  >
                    Load Previous
                  </LoadingButton>
                )}
                <section className="w-100">
                  {data?.pages?.map(
                    (pageData: PaginatedRecreationResourceModel) =>
                      pageData.data.map(
                        (recreationResource: RecreationResourceSearchModel) => (
                          <RecResourceCard
                            key={recreationResource.rec_resource_id}
                            recreationResource={recreationResource}
                          />
                        ),
                      ),
                  )}
                </section>
                {hasNextPage && (
                  <LoadingButton
                    onClick={handleLoadMore}
                    loading={isFetchingNextPage}
                  >
                    Load More
                  </LoadingButton>
                )}
              </Stack>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchPage;
