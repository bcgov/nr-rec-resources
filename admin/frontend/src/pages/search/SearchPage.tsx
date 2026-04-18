import { Button, Card, Stack } from 'react-bootstrap';
import { Link } from '@tanstack/react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faFilter } from '@fortawesome/free-solid-svg-icons';
import { ROUTE_PATHS } from '@/constants/routes';
import { PageLayout } from '@/components/page-layout';
import { useAdminSearchController } from '@/pages/search/hooks/useAdminSearchController';
import { useAdminSearchColumns } from '@/pages/search/hooks/useAdminSearchColumns';
import { SearchSubmitBar } from '@/pages/search/components/SearchSubmitBar';
import { FilterAccordion } from '@/pages/search/components/FilterAccordion';
import { AppliedFilterChips } from '@/pages/search/components/AppliedFilterChips';
import { ColumnVisibilityMenu } from '@/pages/search/components/ColumnVisibilityMenu';
import { SearchResultsTable } from '@/pages/search/components/SearchResultsTable';
import { SearchResultsPagination } from '@/pages/search/components/SearchResultsPagination';
import { SearchResultsSummary } from '@/pages/search/components/SearchResultsSummary';
import { Route } from '@/routes';
import { resolveAdminSearchRouteState } from '@/pages/search/utils/searchSchema';
import './SearchPage.scss';
import { useState } from 'react';

export function SearchPage() {
  const search = resolveAdminSearchRouteState(Route.useSearch());
  const controller = useAdminSearchController(search);
  const columns = useAdminSearchColumns();
  const filterDraftKey = JSON.stringify({
    type: search.type,
    district: search.district,
    activities: search.activities,
    status: search.status,
    access: search.access,
    establishment_date_from: search.establishment_date_from,
    establishment_date_to: search.establishment_date_to,
  });

  const [communityFilter, setCommunityFilter] = useState<string[]>([]);

  const clearCommunityFilter = (value: string) => {
    const communityId = value.split(':')[1];
    if (communityId) {
      setCommunityFilter((current) =>
        current.filter((entry) => entry !== communityId),
      );
    }
  };

  const addCommunityFilter = (communityId: string) => {
    setCommunityFilter((current) => {
      if (current.includes(communityId)) {
        return current;
      }
      return [...current, communityId];
    });
  };

  return (
    <PageLayout>
      <Stack gap={4} className="search-page">
        <h1 className="mb-2">Search</h1>

        <Card body>
          <Stack gap={3}>
            <SearchSubmitBar
              key={search.q}
              committedQuery={search.q}
              onSubmit={controller.submitQuery}
              onFilterCommunity={addCommunityFilter}
            />
          </Stack>
        </Card>

        <Card body>
          <Stack gap={3}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <h2 className="mb-0 h3">Results</h2>
              <Stack
                direction="horizontal"
                gap={3}
                className="justify-content-end flex-wrap"
              >
                <Link
                  className="control-button btn btn-outline-primary d-inline-flex align-items-center gap-2"
                  to={ROUTE_PATHS.EXPORTS}
                >
                  <FontAwesomeIcon
                    icon={faFile}
                    className="d-none d-sm-inline"
                    aria-hidden="true"
                  />
                  Data export
                </Link>
                <ColumnVisibilityMenu
                  visibleColumns={columns.visibleColumns}
                  onToggle={columns.toggleColumn}
                />
                <Button
                  variant="outline-primary"
                  onClick={controller.toggleFilterPanel}
                  className={`control-button d-flex align-items-center gap-2${
                    controller.isFilterPanelOpen ? ' is-active' : ''
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faFilter}
                    className="d-none d-sm-inline"
                  />
                  Filters
                </Button>
              </Stack>
            </div>

            <FilterAccordion
              key={filterDraftKey}
              search={search}
              controller={controller}
              showTrigger={false}
              communityFilter={communityFilter}
            />

            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-3">
              <div>
                <SearchResultsSummary
                  isLoading={controller.isResultsFetching}
                  total={controller.total}
                  query={search.q}
                />
              </div>
              {controller.hasAppliedState && (
                <AppliedFilterChips
                  chips={controller.appliedFilterChips}
                  onClearCommunity={clearCommunityFilter}
                />
              )}
            </div>

            <SearchResultsTable
              rows={controller.results}
              visibleColumns={columns.visibleColumns}
              sort={search.sort}
              pagination={controller.pagination}
              isLoading={controller.isResultsFetching}
              onSortChange={controller.setSort}
            />

            <SearchResultsPagination pagination={controller.pagination} />
          </Stack>
        </Card>
      </Stack>
    </PageLayout>
  );
}
