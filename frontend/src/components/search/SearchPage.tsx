import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '@tanstack/react-store';
import RecResourceCard from '@/components/rec-resource/card/RecResourceCard';
import SearchBanner from '@/components/search/SearchBanner';
import FilterChips from '@/components/search/filters/FilterChips';
import FilterMenu from '@/components/search/filters/FilterMenu';
import FilterMenuMobile from '@/components/search/filters/FilterMenuMobile';
import filterChipStore from '@/store/filterChips';
import searchResultsStore, { initialState } from '@/store/searchResults';
import { useSearchRecreationResourcesPaginated } from '@/service/queries/recreation-resource';
import { useInitialPageFromSearchParams } from '@/components/search/hooks/useInitialPageFromSearchParams';
import setFilterChipsFromSearchParams from '@/components/search/utils/setFilterChipsFromSearchParams';
import {
  PaginatedRecreationResourceModel,
  RecreationResourceSearchModel,
} from '@/service/custom-models';
import { LoadingButton } from '@/components/LoadingButton';
import { Col, ProgressBar, Row, Stack } from 'react-bootstrap';

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
    page: initialPage,
  });

  const searchResults = useStore(searchResultsStore);
  const filterChips = useStore(filterChipStore);

  useEffect(() => {
    searchResultsStore.setState(() => data ?? initialState);
  }, [data]);

  useEffect(() => {
    setFilterChipsFromSearchParams(filterChips, searchResults, searchParams);
  }, [searchResults]);

  const { pages: paginatedResults, totalCount } = searchResults;

  /**
   * Handles loading the next page of search results.
   *
   * This function fetches the next page of results from the API and updates the
   * search parameters in the URL. After fetching the new data, it smoothly
   * scrolls the viewport to the last item of the previously loaded page.
   */
  const handleLoadMore = async () => {
    // Store reference to last item of current list before loading more
    const lastItem = document.querySelector(
      '.search-container section',
    )?.lastElementChild;

    const newSearchParams = {
      ...Object.fromEntries(searchParams),
      page: (Number(data?.currentPage || 1) + 1).toString(),
    };
    setSearchParams(newSearchParams);

    await fetchNextPage();

    // scroll the last item of the previous list into view
    setTimeout(() => {
      lastItem?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const handleLoadPrevious = () => {
    fetchPreviousPage();
  };

  const handleOpenMobileFilter = () => {
    setIsMobileFilterOpen(true);
  };

  const isFetchingFirstPage =
    isFetching && !isFetchingPreviousPage && !isFetchingNextPage;

  return (
    <>
      <SearchBanner />
      <Stack
        direction="horizontal"
        className="page-container bg-brown-light justify-content-start"
      >
        <Row className="page search-container mt-0">
          <Col md={12} lg={3} className="ps-lg-0">
            <FilterMenu />
            <FilterMenuMobile
              isOpen={isMobileFilterOpen}
              setIsOpen={setIsMobileFilterOpen}
            />
          </Col>

          <Col md={12} lg={9} className="pe-lg-0">
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
            {isFetching && !isFetchingPreviousPage && !isFetchingNextPage ? (
              <ProgressBar animated now={100} className="mb-4" />
            ) : (
              <Stack gap={3} className="align-items-center">
                {hasPreviousPage && (
                  <LoadingButton
                    onClick={handleLoadPrevious}
                    loading={isFetchingPreviousPage}
                    className={'load-more-btn'}
                    disabled={isFetchingPreviousPage}
                  >
                    Load Previous
                  </LoadingButton>
                )}
                <section className="w-100">
                  {paginatedResults?.flatMap(
                    (pageData: PaginatedRecreationResourceModel) =>
                      pageData?.data.map(
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
                    className={'load-more-btn'}
                    disabled={isFetchingNextPage}
                  >
                    Load More
                  </LoadingButton>
                )}
              </Stack>
            )}
          </Col>
        </Row>
      </Stack>
    </>
  );
};

export default SearchPage;
