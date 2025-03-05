import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import RecResourceCard from '@/components/rec-resource/card/RecResourceCard';
import SearchBanner from '@/components/search/SearchBanner';
import ProgressBar from 'react-bootstrap/ProgressBar';
import FilterChips from '@/components/search/filters/FilterChips';
import FilterMenu from '@/components/search/filters/FilterMenu';
import FilterMenuMobile from '@/components/search/filters/FilterMenuMobile';
import searchResultsStore, { initialState } from '@/store/searchResults';
import {
  PaginatedRecreationResourceDto,
  RecreationResourceDto,
} from '@/service/recreation-resource';
import { useSearchRecreationResourcesPaginated } from '@/service/queries/recreation-resource';
import { useInitialPageFromSearchParams } from '@/components/search/hooks/useInitialPageFromSearchParams';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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

  searchResultsStore.setState(() => data ?? initialState);

  const { pages: paginatedResults, totalCount } = searchResultsStore.state;

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

  const handleOpenMobileFilter = () => {
    setIsMobileFilterOpen(true);
  };

  return (
    <>
      <SearchBanner />
      <div className="page-container bg-brown-light">
        <div className="page page-padding search-container">
          <FilterMenu />
          <FilterMenuMobile
            isOpen={isMobileFilterOpen}
            setIsOpen={setIsMobileFilterOpen}
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
                  {totalCount ? (
                    <span>
                      <strong>{totalCount.toLocaleString()}</strong>
                      {` ${totalCount === 1 ? 'Result' : 'Results'}`}
                    </span>
                  ) : (
                    'No results found'
                  )}
                </div>
              )}
            </div>
            <FilterChips />

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
                paginatedResults?.flatMap(
                  (pageData: PaginatedRecreationResourceDto) =>
                    pageData?.data.map(
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
