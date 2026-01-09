import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import DownloadKmlResultsModal from './DownloadKmlResultsModal';

// ─── Safe, Hoistable Mocks ────────────────────────────────────────────────

// Mock react-bootstrap Modal and its subcomponents
vi.mock('react-bootstrap', async () => {
  const actual = await vi.importActual<any>('react-bootstrap');

  const Modal = ({ show, children, ...props }: any) =>
    show ? <div {...props}>{children}</div> : null;

  Modal.Body = ({ children }: any) => <div>{children}</div>;

  return {
    ...actual,
    Modal,
  };
});

// FontAwesome mocks
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, ...props }: any) => <span {...props}>{icon}</span>,
}));

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faXmark: 'faXmark',
  faExclamationTriangle: 'faExclamationTriangle',
  faInfoCircle: 'faInfoCircle',
}));

// Mock React Query hook
vi.mock('@/service/queries/recreation-resource', () => ({
  useRecreationResourcesWithGeometryMutation: vi.fn(() => ({
    data: undefined,
    isSuccess: false,
    isError: false,
    isLoading: false,
    status: 'idle',
  })),
}));

// ─── Tests ────────────────────────────────────────────────────────────────

describe('DownloadKmlResultsModal', () => {
  const setIsOpenMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal content when open', () => {
    render(
      <DownloadKmlResultsModal
        isOpen={true}
        setIsOpen={setIsOpenMock}
        searchResultsNumber={3}
        ids={['r1', 'r2', 'r3']}
        trackingView="list"
      />,
    );

    expect(screen.getByText('Download KML')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <DownloadKmlResultsModal
        isOpen={false}
        setIsOpen={setIsOpenMock}
        searchResultsNumber={1}
        ids={['r1']}
        trackingView="list"
      />,
    );
    expect(screen.queryByText('Export map file')).not.toBeInTheDocument();
  });

  it('calls setIsOpen(false) when close button clicked', () => {
    render(
      <DownloadKmlResultsModal
        isOpen={true}
        setIsOpen={setIsOpenMock}
        searchResultsNumber={1}
        ids={['r1']}
        trackingView="list"
      />,
    );

    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);
    expect(setIsOpenMock).toHaveBeenCalledWith(false);
  });

  it('calls setIsOpen(false) when cancel button clicked', () => {
    render(
      <DownloadKmlResultsModal
        isOpen={true}
        setIsOpen={setIsOpenMock}
        searchResultsNumber={2}
        ids={['r1']}
        trackingView="list"
      />,
    );

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);
    expect(setIsOpenMock).toHaveBeenCalledWith(false);
  });
});
