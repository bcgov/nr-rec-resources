import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '@tanstack/react-store';
import { Col, ProgressBar, Row, Stack } from 'react-bootstrap';
import RecResourceCard from '@/components/rec-resource/card/RecResourceCard';
import {
  NoResults,
  SearchBanner,
  SearchMap,
  SearchViewControls,
} from '@/components/search';
import {
  FilterChips,
  FilterMenu,
  FilterMenuMobile,
} from '@/components/search/filters';
import filterChipStore from '@/store/filterChips';
import searchResultsStore, { initialState } from '@/store/searchResults';
import { useSearchRecreationResourcesPaginated } from '@/service/queries/recreation-resource';
import { useInitialPageFromSearchParams } from '@/components/search/hooks/useInitialPageFromSearchParams';
import setFilterChipsFromSearchParams from '@/components/search/utils/setFilterChipsFromSearchParams';
import {
  PaginatedRecreationResourceModel,
  RecreationResourceSearchModel,
} from '@/service/custom-models';
import { trackEvent } from '@/utils/matomo';
import { LoadingButton } from '@/components/LoadingButton';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const initialPage = useInitialPageFromSearchParams();
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const community = searchParams.get('community');
  const searchFilter = searchParams.get('filter');

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
    lat: lat ? Number(lat) : undefined,
    lon: lon ? Number(lon) : undefined,
    community: community ?? undefined,
    type: searchParams.get('type') ?? undefined,
    page: initialPage,
  });

  const searchResults = useStore(searchResultsStore);
  const filterChips = useStore(filterChipStore);
  const isMapFeature = searchParams.get('map-feature') === 'true';
  const isMapView = searchParams.get('view') === 'map';

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
    trackEvent({
      category: 'Search',
      action: 'Click',
      name: 'Load more results',
    });
  };

  const handleLoadPrevious = () => {
    fetchPreviousPage();
    trackEvent({
      category: 'Search',
      action: 'Click',
      name: 'Load previous results',
    });
  };

  const handleOpenMobileFilter = () => {
    setIsMobileFilterOpen(true);
    trackEvent({
      category: 'Search',
      action: 'Click',
      name: 'Open mobile filter menu',
    });
  };

  const isFetchingFirstPage =
    isFetching && !isFetchingPreviousPage && !isFetchingNextPage;
  const isLocationSearchResults = lat && lon && community;

  return (
    <>
      <SearchBanner />
      <SearchMap
        style={{
          visibility: isMapView ? 'visible' : 'hidden',
        }}
      />
      <Stack
        direction="horizontal"
        className="page-container bg-brown-light justify-content-start"
      >
        <Row className="page search-container search-page-row">
          <Col md={12} lg={3}>
            <FilterMenu />
            <FilterMenuMobile
              isOpen={isMobileFilterOpen}
              setIsOpen={setIsMobileFilterOpen}
            />
          </Col>

          <Col md={12} lg={9}>
            <button
              aria-label="Open mobile filter menu"
              onClick={handleOpenMobileFilter}
              className="btn btn-secondary show-filters-btn-mobile"
            >
              Filter
            </button>

            <div className="d-flex align-items-center justify-content-between">
              {isFetchingFirstPage ? (
                <div>Searching...</div>
              ) : (
                <div className="w-100">
                  <div className="results-text">
                    <div>
                      <strong>
                        {totalCount !== undefined &&
                          totalCount.toLocaleString()}
                      </strong>
                      {` ${totalCount === 1 ? 'Result' : 'Results'}`}{' '}
                      {searchFilter && (
                        <>
                          containing <strong>&apos;{searchFilter}&apos;</strong>
                        </>
                      )}
                      {isLocationSearchResults && (
                        <span>
                          {' '}
                          within <b>50 km</b> radius of <b>{community}</b>
                        </span>
                      )}
                    </div>
                    {isMapFeature && <SearchViewControls variant="map" />}
                  </div>
                  <FilterChips />
                  {(totalCount === 0 || totalCount === undefined) && (
                    <>
                      <NoResults />
                    </>
                  )}
                </div>
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
