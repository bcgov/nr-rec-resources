import { RecResourceAssetsEditPage } from '@/pages/rec-resource-page/RecResourceAssetsEditPage';
import { ROUTE_PATHS } from '@/constants/routes';
import type { AssetEditFormValues } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/AssetCardEdit';
import type {
  Asset,
  AssetCode,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import {
  useGetAssetCodes,
  useGetAssetsByRecResourceId,
  useGetRecreationResourceById,
  useGetRepairCodes,
  useUpdateAsset,
  useUpdateAssetRepair,
  useUpdateRecreationResource,
} from '@/services/hooks/recreation-resource-admin';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: vi.fn(),
    useSearch: vi.fn(),
  };
});

vi.mock('@/services/hooks/recreation-resource-admin', () => ({
  useGetAssetCodes: vi.fn(),
  useGetAssetsByRecResourceId: vi.fn(),
  useGetRecreationResourceById: vi.fn(),
  useGetRepairCodes: vi.fn(),
  useUpdateAsset: vi.fn(),
  useUpdateAssetRepair: vi.fn(),
  useUpdateRecreationResource: vi.fn(),
}));

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceAssetsSection/InspectionDatesEdit',
  () => ({
    InspectionDatesEdit: ({
      onInspectionDateChange,
      onDangerTreeDateChange,
      onSave,
      onCancel,
    }: any) => (
      <div data-testid="inspection-dates-edit">
        <button onClick={() => onInspectionDateChange('2026-04-01')}>
          set-inspection-date
        </button>
        <button onClick={() => onDangerTreeDateChange('2026-04-02')}>
          set-danger-date
        </button>
        <button onClick={onSave}>save-inspections</button>
        <button onClick={onCancel}>cancel-inspections</button>
      </div>
    ),
  }),
);

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceAssetsSection/AssetSummaryCards',
  () => ({
    AssetSummaryCards: () => <div data-testid="asset-summary-cards" />,
  }),
);

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceAssetsSection/AssetTypeCard',
  () => ({
    AssetTypeCard: ({ eventKey, onEdit, children }: any) => (
      <div data-testid={`asset-type-card-${eventKey}`}>
        <button onClick={onEdit}>edit-group-{eventKey}</button>
        {children}
      </div>
    ),
  }),
);

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceAssetsSection/AssetTypeCardEdit',
  () => ({
    AssetTypeCardEdit: ({ eventKey, onSave, onCancel, children }: any) => (
      <div data-testid={`asset-type-card-edit-${eventKey}`}>
        <button onClick={onSave}>save-group-{eventKey}</button>
        <button onClick={onCancel}>cancel-group-{eventKey}</button>
        {children}
      </div>
    ),
  }),
);

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceAssetsSection/AssetCard',
  () => ({
    AssetCard: ({ asset }: any) => <div>asset-view-{asset.asset_id}</div>,
  }),
);

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceAssetsSection/AssetCardEdit',
  () => ({
    AssetCardEdit: ({ asset, onChange, onRepairChange }: any) => {
      const payload: AssetEditFormValues = {
        asset_comment: 'Updated comment',
        asset_length: '11',
        asset_width: '',
        asset_area: '33.5',
        longitude: '-123.4',
        latitude: '49.2',
        actual_value: '88.1',
      };

      return (
        <div>
          <button onClick={() => onChange(asset.asset_id, payload)}>
            queue-asset-{asset.asset_id}
          </button>
          <button
            onClick={() =>
              onRepairChange?.(700 + asset.asset_id, {
                estimated_repair_cost: 45,
              })
            }
          >
            queue-repair-{asset.asset_id}
          </button>
        </div>
      );
    },
  }),
);

function buildAsset(overrides: Partial<Asset> = {}): Asset {
  return {
    asset_id: 10,
    parent_id: null,
    rec_resource_id: 'REC123',
    asset_code: 100,
    asset_name: 'Bridge A',
    asset_tag: null,
    asset_comment: null,
    legacy_structure_id: null,
    asset_length: null,
    asset_width: null,
    asset_area: null,
    actual_value: null,
    installation_date: null,
    updated_by: null,
    updated_at: null,
    geometry_type_code: null,
    latitude: null,
    longitude: null,
    recreation_asset_repair: [],
    ...overrides,
  };
}

const assetCodes: AssetCode[] = [
  {
    asset_code: 100,
    description: 'Bridge',
    has_length: true,
    has_width: true,
    has_area: true,
    default_value: 10,
  },
];

describe('RecResourceAssetsEditPage', () => {
  const mockNavigate = vi.fn();
  const mockUpdateAsset = vi.fn().mockResolvedValue(undefined);
  const mockUpdateRepair = vi.fn().mockResolvedValue(undefined);
  const mockUpdateResource = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useParams).mockReturnValue({ id: 'REC123' } as any);
    vi.mocked(useSearch).mockReturnValue({} as any);
    vi.mocked(useNavigate).mockReturnValue(mockNavigate as any);

    vi.mocked(useGetAssetsByRecResourceId).mockReturnValue({
      data: [buildAsset()],
      isLoading: false,
      isError: false,
    } as any);
    vi.mocked(useGetAssetCodes).mockReturnValue({ data: assetCodes } as any);
    vi.mocked(useGetRepairCodes).mockReturnValue({ data: [] } as any);
    vi.mocked(useGetRecreationResourceById).mockReturnValue({
      data: {
        last_rec_inspection_date: '2026-03-15T00:00:00.000Z',
        last_hzrd_tree_assess_date: '2026-03-16T00:00:00.000Z',
      },
    } as any);

    vi.mocked(useUpdateAsset).mockReturnValue({
      mutateAsync: mockUpdateAsset,
    } as any);
    vi.mocked(useUpdateAssetRepair).mockReturnValue({
      mutateAsync: mockUpdateRepair,
    } as any);
    vi.mocked(useUpdateRecreationResource).mockReturnValue({
      mutateAsync: mockUpdateResource,
    } as any);
  });

  it('shows loading state while assets are loading', () => {
    vi.mocked(useGetAssetsByRecResourceId).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    render(<RecResourceAssetsEditPage />);

    expect(
      screen.getByRole('status', { name: 'Loading assets' }),
    ).toBeInTheDocument();
  });

  it('shows error state when assets fail to load', () => {
    vi.mocked(useGetAssetsByRecResourceId).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as any);

    render(<RecResourceAssetsEditPage />);

    expect(
      screen.getByText(
        'Unable to load assets right now. Please try again later.',
      ),
    ).toBeInTheDocument();
  });

  it('navigates to edit mode when a type group Edit action is triggered', async () => {
    const user = userEvent.setup();

    render(<RecResourceAssetsEditPage />);

    await user.click(screen.getByRole('button', { name: 'edit-group-100' }));

    expect(mockNavigate).toHaveBeenCalledWith({
      to: ROUTE_PATHS.REC_RESOURCE_ASSETS_EDIT,
      params: { id: 'REC123' },
      search: { editGroup: '100' },
    });
  });

  it('saves queued asset and repair changes in edit mode, then navigates back to assets', async () => {
    const user = userEvent.setup();
    vi.mocked(useSearch).mockReturnValue({ editGroup: '100' } as any);

    render(<RecResourceAssetsEditPage />);

    await user.click(screen.getByRole('button', { name: 'queue-asset-10' }));
    await user.click(screen.getByRole('button', { name: 'queue-repair-10' }));
    await user.click(screen.getByRole('button', { name: 'save-group-100' }));

    await waitFor(() => {
      expect(mockUpdateAsset).toHaveBeenCalledWith({
        assetId: 10,
        recResourceId: 'REC123',
        dto: {
          asset_comment: 'Updated comment',
          asset_length: 11,
          asset_width: undefined,
          asset_area: 33.5,
          actual_value: 88.1,
        },
      });
      expect(mockUpdateRepair).toHaveBeenCalledWith({
        repairId: 710,
        recResourceId: 'REC123',
        dto: { estimated_repair_cost: 45 },
      });
      expect(mockNavigate).toHaveBeenCalledWith({
        to: ROUTE_PATHS.REC_RESOURCE_ASSETS,
        params: { id: 'REC123' },
      });
    });
  });

  it('opens inspection edit and saves inspection dates', async () => {
    const user = userEvent.setup();

    render(<RecResourceAssetsEditPage />);

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(
      screen.getByRole('button', { name: 'Edit inspection dates' }),
    );

    expect(screen.getByTestId('inspection-dates-edit')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'set-inspection-date' }),
    );
    await user.click(screen.getByRole('button', { name: 'set-danger-date' }));
    await user.click(screen.getByRole('button', { name: 'save-inspections' }));

    await waitFor(() => {
      expect(mockUpdateResource).toHaveBeenCalledWith({
        recResourceId: 'REC123',
        updateRecreationResourceDto: {
          last_rec_inspection_date: '2026-04-01',
          last_hzrd_tree_assess_date: '2026-04-02',
        },
      });
    });
  });
});
