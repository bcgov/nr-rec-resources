import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageTitle from '@/components/layout/PageTitle';
import { ROUTE_TITLES, ROUTE_PATHS } from '@/routes/constants';
import {
  AlphabeticalList,
  AlphabeticalNavigation,
} from '@/components/alphabetical-list';
import { useAlphabeticalResources } from '@/service/queries/recreation-resource/recreationResourceQueries';
import { Breadcrumbs, useBreadcrumbs } from '@shared/components/breadcrumbs';

const AlphabeticalListPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useBreadcrumbs();

  const selectedLetter = searchParams.get('letter') ?? 'A';
  const selectedType = searchParams.get('type') ?? undefined;

  // Redirect to 'A' if no letter is specified
  useEffect(() => {
    if (!searchParams.get('letter')) {
      navigate(`${ROUTE_PATHS.ALPHABETICAL}?letter=A`, { replace: true });
    }
  }, [searchParams, navigate]);

  const { data: resources, isLoading } = useAlphabeticalResources(
    selectedLetter,
    selectedType,
  );

  return (
    <>
      <PageTitle title={ROUTE_TITLES.ALPHABETICAL} />
      <div className="page page-padding content-footer-spacing">
        <Breadcrumbs />
        <h1 className="my-4">A-Z list</h1>
        <AlphabeticalNavigation
          selectedLetter={selectedLetter}
          selectedType={selectedType}
        />
        <AlphabeticalList
          resources={resources}
          isLoading={isLoading}
          selectedLetter={selectedLetter}
        />
      </div>
    </>
  );
};

export default AlphabeticalListPage;
