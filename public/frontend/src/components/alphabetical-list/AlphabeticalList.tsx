import { Alert, Spinner } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { ROUTE_PATHS } from '@/routes/constants';
import { AlphabeticalRecreationResourceModel } from '@/service/custom-models';
import { capitalizeWords } from '@/utils/capitalizeWords';
import '@/components/alphabetical-list/AlphabeticalList.scss';

interface AlphabeticalListProps {
  resources: AlphabeticalRecreationResourceModel[] | undefined;
  isLoading: boolean;
  selectedLetter: string;
}

export const AlphabeticalList = ({
  resources,
  isLoading,
  selectedLetter,
}: AlphabeticalListProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isTypeFilters = !!searchParams.get('type');

  const clearTypeFilter = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('type');
    setSearchParams(newSearchParams);
  };
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2 text-muted">Loading resources...</p>
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <Alert variant="info" className="not-found-alert">
        <Alert.Heading>No results found</Alert.Heading>
        <p>
          No results found starting with "{selectedLetter}". Try selecting a
          different letter{isTypeFilters ? ' or ' : ''}
          {isTypeFilters && (
            <button
              type="button"
              className="btn btn-link clear-type-btn p-0 align-baseline"
              onClick={clearTypeFilter}
            >
              clearing your filters
            </button>
          )}
          .
        </p>
      </Alert>
    );
  }

  return (
    <div className="alphabetical-resource-list">
      <h2 className="h5 mb-3">{selectedLetter} </h2>

      <ul className="list-unstyled">
        {resources.map((resource) => {
          const {
            closest_community,
            name,
            rec_resource_id,
            recreation_resource_type,
          } = resource;
          const formattedName = capitalizeWords(name);
          const formattedCommunity = capitalizeWords(closest_community);

          return (
            <li key={resource.rec_resource_id} className="mb-2">
              <Link
                to={ROUTE_PATHS.REC_RESOURCE.replace(':id', rec_resource_id)}
                className="text-decoration-none"
              >
                {formattedName}
              </Link>
              <span className="text-muted">
                {formattedCommunity} | {recreation_resource_type}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
