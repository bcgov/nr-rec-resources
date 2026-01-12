import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { RemoveScroll } from 'react-remove-scroll';
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
import SearchLinks from '@/components/search/SearchLinks';
import SearchLinksMobile from '@/components/search/SearchLinksMobile';
import filterChipStore from '@/store/filterChips';
import searchResultsStore, { initialState } from '@/store/searchResults';
import { useSearchRecreationResourcesPaginated } from '@/service/queries/recreation-resource';
import { useInitialPageFromSearchParams } from '@/components/search/hooks/useInitialPageFromSearchParams';
import setFilterChipsFromSearchParams from '@/components/search/utils/setFilterChipsFromSearchParams';
import {
  PaginatedRecreationResourceModel,
  RecreationResourceSearchModel,
} from '@/service/custom-models';
import { trackEvent } from '@shared/utils';
import { LoadingButton } from '@/components/LoadingButton';
import {
  MATOMO_ACTION_LOADMORE,
  MATOMO_CATEGORY_LOADMORE,
} from '@/constants/analytics';
import DownloadKmlResultsModal from './DownloadKmlResultsModal';

const SearchPage = () => {
  const navigate = useNavigate({ from: '/search' });
  const searchParams = useSearch({ from: '/search/' });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const initialPage = useInitialPageFromSearchParams();
  const lat = searchParams.lat;
  const lon = searchParams.lon;
  const community = searchParams.community;
  const searchFilter = searchParams.filter;

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
    filter: searchParams.filter ?? undefined,
    district: searchParams.district ?? undefined,
    activities:
      searchParams.activities != null
        ? String(searchParams.activities)
        : undefined,
    access: searchParams.access ?? undefined,
    facilities: searchParams.facilities ?? undefined,
    status: searchParams.status ?? undefined,
    fees: searchParams.fees ?? undefined,
    lat: lat ? Number(lat) : undefined,
    lon: lon ? Number(lon) : undefined,
    community: community ?? undefined,
    type: searchParams.type ?? undefined,
    page: initialPage,
  });

  const searchResults = useStore(searchResultsStore);
  const filterChips = useStore(filterChipStore);
  const isMapView = searchParams.view === 'map';
  const trackingView = isMapView ? 'map' : 'list';

  useEffect(() => {
    searchResultsStore.setState(() => data ?? initialState);
  }, [data]);

  useEffect(() => {
    setFilterChipsFromSearchParams(filterChips, searchResults, searchParams);
    // eslint-disable-next-line
  }, [searchResults]);

  const { pages: paginatedResults, totalCount, recResourceIds } = searchResults;
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

    navigate({
      search: (prev) => ({
        ...prev,
        page: Number(data?.currentPage || 1) + 1,
      }),
      resetScroll: false,
    });

    const nextPage = Number(data?.currentPage || 1) + 1;
    const start = (nextPage - 1) * 10 + 1;
    const end = Math.min(nextPage * 10, totalCount);
    const paginationInfo = `${start}-${end}`;

    await fetchNextPage();

    // scroll the last item of the previous list into view
    setTimeout(() => {
      lastItem?.scrollIntoView({ behavior: 'smooth' });
    });
    trackEvent({
      category: MATOMO_CATEGORY_LOADMORE,
      action: MATOMO_ACTION_LOADMORE,
      name: `${MATOMO_ACTION_LOADMORE}_${paginationInfo}`,
    });
  };

  const handleLoadPrevious = () => {
    fetchPreviousPage();
  };

  const handleOpenMobileFilter = () => {
    setIsMobileFilterOpen(true);
  };

  const handleDownloadClick = useCallback(() => {
    setIsDownloadModalOpen(true);
  }, []);

  const isFetchingFirstPage =
    isFetching && !isFetchingPreviousPage && !isFetchingNextPage;
  const isLocationSearchResults = lat && lon && community;
  return (
    <>
      <SearchBanner />
      <RemoveScroll enabled={isMapView}>
        <SearchMap
          totalCount={totalCount}
          ids={paginatedResults?.flatMap(
            (pageData: PaginatedRecreationResourceModel) =>
              pageData?.recResourceIds,
          )}
          props={{
            style: {
              visibility: isMapView ? 'visible' : 'hidden',
            },
          }}
        />
      </RemoveScroll>
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
            <SearchLinks downloadKMLModalFunction={handleDownloadClick} />
          </Col>

          <Col md={12} lg={9}>
            <button
              aria-label="Open mobile filter menu"
              onClick={handleOpenMobileFilter}
              className="btn btn-secondary show-filters-btn-mobile"
            >
              Filter
            </button>
            <SearchLinksMobile
              totalCount={totalCount}
              ids={paginatedResults?.flatMap(
                (pageData: PaginatedRecreationResourceModel) =>
                  pageData?.recResourceIds,
              )}
              trackingView={trackingView ?? (isMapView ? 'list' : 'map')}
            />

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
                    <div>
                      <SearchViewControls variant="map" />
                    </div>
                  </div>
                  <FilterChips />
                  {totalCount === 0 && <NoResults />}
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
      <DownloadKmlResultsModal
        isOpen={isDownloadModalOpen}
        setIsOpen={setIsDownloadModalOpen}
        searchResultsNumber={totalCount}
        ids={recResourceIds}
        trackingView={trackingView ?? (isMapView ? 'list' : 'map')}
      />
    </>
  );
};

export default SearchPage;
