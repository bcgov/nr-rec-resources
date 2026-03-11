import { PageLayout, Table as DataTable } from '@/components';
import { Breadcrumbs } from '@shared/index';
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { NOT_IMPLEMENTED_INFO } from './constants';
import { useExportState } from './hooks/useExportState';

const isDatasetUnavailable = (info?: string) => info === NOT_IMPLEMENTED_INFO;

export const ExportsPage = () => {
  const { datasets, filters, preview, download } = useExportState();
  const {
    handleDatasetChange,
    handleDistrictChange,
    handleResourceTypeChange,
  } = filters.handlers;

  const hasSelectedDataset = Boolean(datasets.selected);
  const isSelectedDatasetUnavailable = isDatasetUnavailable(
    datasets.selected?.info,
  );
  const areFilterSelectsDisabled = !hasSelectedDataset || filters.isLoading;
  const showPreviewTable =
    preview.isEnabled && preview.data && !preview.isLoading;

  return (
    <PageLayout>
      <div className="d-flex flex-column gap-4">
        <Breadcrumbs />

        <h1 className="mb-1">Data export</h1>

        {datasets.error ? (
          <Alert variant="danger" className="mb-0">
            Failed to load export datasets. Refresh and try again.
          </Alert>
        ) : null}

        <Card>
          <Card.Body>
            <h2 className="h5">Choose a dataset</h2>
            <p className="text-muted">
              To preview its current rows and download the live CSV from the
              admin API. Disabled options represent features planned for future
              development.
            </p>
            {datasets.selected?.info ? (
              <Alert variant="warning" className="mb-3">
                {datasets.selected.info}
              </Alert>
            ) : (
              <Alert variant="light" className="mb-3">
                <div>
                  <strong>FTA</strong> is the legacy export data shape from the
                  previous system.
                </div>
                <div>
                  <strong>RST</strong> is the new database schema and long-term
                  target, but some exports are still incomplete while migration
                  work continues.
                </div>
              </Alert>
            )}

            <Row className="g-3">
              <Col md={4}>
                <Form.Group controlId="export-dataset">
                  <Form.Label>Dataset</Form.Label>
                  <Form.Select
                    value={datasets.selected?.id ?? ''}
                    onChange={handleDatasetChange}
                    disabled={datasets.isLoading}
                  >
                    <option value="">
                      {datasets.isLoading
                        ? 'Loading datasets...'
                        : 'Select a dataset'}
                    </option>
                    {datasets.grouped.map((group) => (
                      <optgroup key={group.source} label={group.source}>
                        {group.datasets.map((dataset) => (
                          <option
                            key={dataset.id}
                            value={dataset.id}
                            disabled={isDatasetUnavailable(dataset.info)}
                          >
                            {dataset.label}
                            {isDatasetUnavailable(dataset.info)
                              ? ' (Not implemented)'
                              : ''}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="export-district">
                  <Form.Label>District</Form.Label>
                  <Form.Select
                    value={filters.district}
                    onChange={handleDistrictChange}
                    disabled={areFilterSelectsDisabled}
                  >
                    <option value="">
                      {filters.isLoading
                        ? 'Loading districts...'
                        : 'All districts'}
                    </option>
                    {filters.options.districtOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="export-resource-type">
                  <Form.Label>Recreation resource type</Form.Label>
                  <Form.Select
                    value={filters.resourceType}
                    onChange={handleResourceTypeChange}
                    disabled={areFilterSelectsDisabled}
                  >
                    <option value="">
                      {filters.isLoading ? 'Loading types...' : 'All types'}
                    </option>
                    {filters.options.resourceTypeOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2 mt-3">
              <Button
                disabled={download.isDisabled}
                onClick={download.handleDownload}
                variant="primary"
                style={{ minWidth: '8.5rem' }}
              >
                {download.isDownloading ? (
                  <span className="d-inline-flex justify-content-center w-100 align-items-center gap-2">
                    <Spinner
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span className="visually-hidden">Downloading CSV</span>
                  </span>
                ) : (
                  'Download CSV'
                )}
              </Button>
            </div>

            {hasSelectedDataset && isSelectedDatasetUnavailable ? (
              <p className="mt-3 mb-0 text-muted">
                This dataset is planned but not implemented yet.
              </p>
            ) : null}
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="d-flex align-items-center gap-2 mb-2">
              <h2 className="h5">Preview</h2>
              {preview.isLoading && (
                <output
                  aria-label="Loading preview"
                  className="d-inline-flex align-items-center gap-2"
                >
                  <Spinner animation="border" size="sm" aria-hidden="true" />
                  <span className="visually-hidden">Loading preview</span>
                </output>
              )}
            </div>

            {preview.error ? (
              <Alert variant="danger" className="mb-0">
                Failed to load the export preview. Adjust filters and try again.
              </Alert>
            ) : null}

            {!preview.isEnabled ? (
              <p className="mb-0 text-muted">
                Choose a dataset to automatically load up to 50 rows from the
                backend.
              </p>
            ) : null}

            {showPreviewTable ? (
              <DataTable
                className="mb-0"
                columns={preview.data.columns.map((column) => ({
                  header: column,
                  render: (row: Record<string, string | null>) =>
                    row[column] ?? '-',
                }))}
                emptyMessage="No rows matched the selected dataset and filters."
                getRowKey={(_, rowIndex) => `row-${rowIndex}`}
                rows={preview.data.rows}
              />
            ) : null}
          </Card.Body>
        </Card>
      </div>
    </PageLayout>
  );
};
