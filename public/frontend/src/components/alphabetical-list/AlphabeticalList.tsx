import { Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/routes/constants';
import { AlphabeticalRecreationResourceModel } from '@/service/custom-models';
import './AlphabeticalList.scss';

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
        <Alert.Heading>No resources found</Alert.Heading>
        <p>
          No recreation resources found starting with "{selectedLetter}". Try
          selecting a different letter.
        </p>
      </Alert>
    );
  }

  return (
    <div className="alphabetical-resource-list">
      <h2 className="h5 mb-3">{selectedLetter} </h2>

      <ul className="list-unstyled">
        {resources.map((resource) => {
          const { name } = resource;
          const formattedName = name.toLowerCase();
          return (
            <li key={resource.rec_resource_id} className="mb-2">
              <Link
                to={ROUTE_PATHS.REC_RESOURCE.replace(
                  ':id',
                  resource.rec_resource_id,
                )}
                className="text-decoration-none"
              >
                {formattedName}
              </Link>
              <span className="text-muted ms-2">
                {resource.recreation_resource_type}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
