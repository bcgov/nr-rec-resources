import { ExportsPage } from '@/pages/exports-page/ExportsPage';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseExportState = vi.fn();

vi.mock('@/pages/exports-page/hooks/useExportState', () => ({
  useExportState: () => mockUseExportState(),
}));

vi.mock('@shared/index', () => ({
  Breadcrumbs: () => <nav data-testid="breadcrumbs" />,
}));

describe('ExportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders unavailable datasets as disabled options and shows the warning state', () => {
    mockUseExportState.mockReturnValue({
      datasets: {
        grouped: [
          {
            source: 'RST',
            datasets: [
              {
                id: 'objective-list',
                label: 'Objective list',
                source: 'RST',
                info: 'not-implemented',
              },
            ],
          },
        ],
        selected: {
          id: 'objective-list',
          label: 'Objective list',
          source: 'RST',
          info: 'not-implemented',
        },
        isLoading: false,
        error: null,
      },
      filters: {
        district: '',
        resourceType: '',
        options: { districtOptions: [], resourceTypeOptions: [] },
        isLoading: false,
        handlers: {
          handleDatasetChange: vi.fn(),
          handleDistrictChange: vi.fn(),
          handleResourceTypeChange: vi.fn(),
        },
      },
      preview: {
        data: undefined,
        isLoading: false,
        error: null,
        isEnabled: false,
      },
      download: {
        isDownloading: false,
        handleDownload: vi.fn(),
        isDisabled: true,
      },
    });

    render(<ExportsPage />);

    expect(
      screen.getByRole('option', { name: 'Objective list (Not implemented)' }),
    ).toBeDisabled();
    expect(screen.getByText('not-implemented')).toBeInTheDocument();
    expect(
      screen.getByText('This dataset is planned but not implemented yet.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Choose a dataset to automatically load up to 50 rows from the backend.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the default guidance and preview values, including null fallbacks', () => {
    mockUseExportState.mockReturnValue({
      datasets: {
        grouped: [
          {
            source: 'RST',
            datasets: [
              {
                id: 'file-details',
                label: 'File details',
                source: 'RST',
              },
            ],
          },
        ],
        selected: {
          id: 'file-details',
          label: 'File details',
          source: 'RST',
        },
        isLoading: false,
        error: null,
      },
      filters: {
        district: '',
        resourceType: '',
        options: { districtOptions: [], resourceTypeOptions: [] },
        isLoading: false,
        handlers: {
          handleDatasetChange: vi.fn(),
          handleDistrictChange: vi.fn(),
          handleResourceTypeChange: vi.fn(),
        },
      },
      preview: {
        data: {
          columns: ['NAME', 'STATUS'],
          rows: [{ NAME: 'Alpha', STATUS: null }],
        },
        isLoading: false,
        error: null,
        isEnabled: true,
      },
      download: {
        isDownloading: false,
        handleDownload: vi.fn(),
        isDisabled: false,
      },
    });

    render(<ExportsPage />);

    expect(
      screen.getByText(/legacy export data shape from the previous system/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/new database schema and long-term target/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('renders loading and error states for datasets and preview', () => {
    mockUseExportState.mockReturnValue({
      datasets: {
        grouped: [],
        selected: null,
        isLoading: true,
        error: new Error('datasets failed'),
      },
      filters: {
        district: '',
        resourceType: '',
        options: { districtOptions: [], resourceTypeOptions: [] },
        isLoading: true,
        handlers: {
          handleDatasetChange: vi.fn(),
          handleDistrictChange: vi.fn(),
          handleResourceTypeChange: vi.fn(),
        },
      },
      preview: {
        data: undefined,
        isLoading: true,
        error: new Error('preview failed'),
        isEnabled: false,
      },
      download: {
        isDownloading: true,
        handleDownload: vi.fn(),
        isDisabled: true,
      },
    });

    render(<ExportsPage />);

    expect(
      screen.getByText(
        'Failed to load export datasets. Refresh and try again.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Failed to load the export preview. Adjust filters and try again.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Loading datasets...' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Loading districts...' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Loading types...' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Downloading CSV' }),
    ).toBeDisabled();
    expect(screen.getAllByRole('status')).toHaveLength(1);
  });

  it('calls filter and download handlers from user actions', () => {
    const handleDatasetChange = vi.fn();
    const handleDistrictChange = vi.fn();
    const handleResourceTypeChange = vi.fn();
    const handleDownload = vi.fn();

    mockUseExportState.mockReturnValue({
      datasets: {
        grouped: [
          {
            source: 'RST',
            datasets: [
              {
                id: 'file-details',
                label: 'File details',
                source: 'RST',
              },
            ],
          },
        ],
        selected: {
          id: 'file-details',
          label: 'File details',
          source: 'RST',
        },
        isLoading: false,
        error: null,
      },
      filters: {
        district: '',
        resourceType: '',
        options: {
          districtOptions: [{ id: 'RDKA', label: 'Kootenay Boundary' }],
          resourceTypeOptions: [{ id: 'SIT', label: 'Recreation site' }],
        },
        isLoading: false,
        handlers: {
          handleDatasetChange,
          handleDistrictChange,
          handleResourceTypeChange,
        },
      },
      preview: {
        data: undefined,
        isLoading: false,
        error: null,
        isEnabled: true,
      },
      download: {
        isDownloading: false,
        handleDownload,
        isDisabled: false,
      },
    });

    render(<ExportsPage />);

    fireEvent.change(screen.getByLabelText('Dataset'), {
      target: { value: 'file-details' },
    });
    fireEvent.change(screen.getByLabelText('District'), {
      target: { value: 'RDKA' },
    });
    fireEvent.change(screen.getByLabelText('Recreation resource type'), {
      target: { value: 'SIT' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));

    expect(handleDatasetChange).toHaveBeenCalledOnce();
    expect(handleDistrictChange).toHaveBeenCalledOnce();
    expect(handleResourceTypeChange).toHaveBeenCalledOnce();
    expect(handleDownload).toHaveBeenCalledOnce();
  });
});
