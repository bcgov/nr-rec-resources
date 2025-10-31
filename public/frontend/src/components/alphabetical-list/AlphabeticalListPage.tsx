import { useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { ROUTE_PATHS } from '@/constants/routes';
import {
  AlphabeticalList,
  AlphabeticalNavigation,
} from '@/components/alphabetical-list';
import { useAlphabeticalResources } from '@/service/queries/recreation-resource/recreationResourceQueries';
import { Breadcrumbs } from '@shared/components/breadcrumbs';

const AlphabeticalListPage = () => {
  const searchParams = useSearch({ from: '/search/a-z-list' });
  const navigate = useNavigate();

  const selectedLetter = searchParams.letter ?? '#';
  const selectedType = searchParams.type ?? undefined;

  // Redirect to '#' if no letter is specified
  useEffect(() => {
    if (!searchParams.letter) {
      // Redirect to '#' if no letter is specified
      navigate({
        to: ROUTE_PATHS.ALPHABETICAL,
        search: { letter: '#' },
        replace: true,
      });
    }
  }, [searchParams, navigate]);

  const { data: resources, isLoading } = useAlphabeticalResources(
    selectedLetter,
    selectedType,
  );

  return (
    <>
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
