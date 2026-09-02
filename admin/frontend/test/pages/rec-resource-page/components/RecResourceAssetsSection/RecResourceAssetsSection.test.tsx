import { RecResourceAssetsSection } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/RecResourceAssetsSection';
import type {
  Asset,
  AssetCode,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import {
  useBulkInsertAssetRepairs,
  useBulkUpdateAssets,
  useGetAssetCodes,
  useGetAssetsByRecResourceId,
  useGetRecreationResourceById,
  useGetRepairCodes,
  useUpdateAsset,
  useUpdateAssetRepair,
  useUpdateRecreationResource,
} from '@/services/hooks/recreation-resource-admin';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { useParams } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

vi.mock('@/services/hooks/recreation-resource-admin', () => ({
  useBulkInsertAssetRepairs: vi.fn(),
  useGetAssetCodes: vi.fn(),
  useGetAssetsByRecResourceId: vi.fn(),
  useGetRecreationResourceById: vi.fn(),
  useGetRepairCodes: vi.fn(),
  useBulkUpdateAssets: vi.fn(),
  useCreateBulkAssets: vi.fn().mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useCreateAssetRepair: vi.fn().mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  }),
  useUpdateRepair: vi.fn().mockReturnValue({
    mutate: vi.fn(),
  }),
  useUpdateRecreationResource: vi.fn().mockReturnValue({
    mutateAsync: vi.fn(),
  }),
  useUpdateAsset: vi.fn().mockReturnValue({
    mutateAsync: vi.fn(),
  }),
  useUpdateAssetRepair: vi.fn().mockReturnValue({
    mutateAsync: vi.fn(),
  }),
}));

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
  addSuccessNotification: vi.fn(),
}));

const buildAsset = (overrides: Partial<Asset> = {}): Asset => ({
  asset_id: 1,
  parent_id: null,
  rec_resource_id: 'REC123',
  asset_code: 100,
  asset_name: 'Asset 1',
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
  recreation_asset_repair: null,
  ...overrides,
});

const assetCodes: AssetCode[] = [{ asset_code: 100, description: 'Bridge' }];
const mockUpdateAsset = vi.fn().mockResolvedValue(undefined);
const mockUpdateRepair = vi.fn().mockResolvedValue(undefined);
const mockUpdateResource = vi.fn().mockResolvedValue(undefined);

describe('RecResourceAssetsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useParams).mockReturnValue({ id: 'REC123' } as any);
    vi.mocked(useGetAssetCodes).mockReturnValue({
      data: assetCodes,
    } as any);
    vi.mocked(useGetRepairCodes).mockReturnValue({
      data: [],
    } as any);
    vi.mocked(useGetAssetsByRecResourceId).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as any);
    vi.mocked(useGetRecreationResourceById).mockReturnValue({
      data: undefined,
    } as any);
    vi.mocked(useBulkInsertAssetRepairs).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
    vi.mocked(useBulkUpdateAssets).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
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

  it('renders the Assets heading', () => {
    render(<RecResourceAssetsSection />);

    expect(
      screen.getByRole('heading', { name: 'Assets', level: 2 }),
    ).toBeInTheDocument();
  });

  it('shows a loading spinner while assets are loading', () => {
    vi.mocked(useGetAssetsByRecResourceId).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    render(<RecResourceAssetsSection />);

    expect(
      screen.getByRole('status', { name: 'Loading assets' }),
    ).toBeInTheDocument();
  });

  it('shows an error message when assets fail to load', () => {
    vi.mocked(useGetAssetsByRecResourceId).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as any);

    render(<RecResourceAssetsSection />);

    expect(
      screen.getByText(
        'Unable to load assets right now. Please try again later.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the asset summary cards', () => {
    vi.mocked(useGetAssetsByRecResourceId).mockReturnValue({
      data: [buildAsset({ actual_value: 500 })],
      isLoading: false,
      isError: false,
    } as any);

    render(<RecResourceAssetsSection />);

    expect(
      screen.getByRole('heading', { name: 'Assets', level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Total value')).toBeInTheDocument();
  });

  it('shows an empty state message when there are no assets', () => {
    vi.mocked(useGetAssetsByRecResourceId).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as any);

    render(<RecResourceAssetsSection />);

    expect(
      screen.getByText('No assets recorded for this resource yet'),
    ).toBeInTheDocument();
  });

  it('does not show the empty state message when there are assets', () => {
    vi.mocked(useGetAssetsByRecResourceId).mockReturnValue({
      data: [buildAsset({ asset_code: 100 })],
      isLoading: false,
      isError: false,
    } as any);

    render(<RecResourceAssetsSection />);

    expect(
      screen.queryByText('No assets recorded for this resource yet'),
    ).not.toBeInTheDocument();
  });

  it('groups assets by type by default', () => {
    vi.mocked(useGetAssetsByRecResourceId).mockReturnValue({
      data: [buildAsset({ asset_code: 100 })],
      isLoading: false,
      isError: false,
    } as any);

    render(<RecResourceAssetsSection />);

    expect(screen.getByText('Bridge')).toBeInTheDocument();
    expect(screen.getByText('Asset 1')).toBeInTheDocument();
  });

  it('does not show the type/campsite toggle when there are no campsites', () => {
    vi.mocked(useGetAssetsByRecResourceId).mockReturnValue({
      data: [buildAsset({ asset_code: 100 })],
      isLoading: false,
      isError: false,
    } as any);

    render(<RecResourceAssetsSection />);

    expect(screen.queryByText('By type')).not.toBeInTheDocument();
    expect(screen.queryByText('By campsite')).not.toBeInTheDocument();
  });

  it('shows the type/campsite toggle and switches views when there are campsites', async () => {
    const user = userEvent.setup();
    const campsite = buildAsset({
      asset_id: 10,
      asset_code: 227,
      asset_name: 'Campsite A',
    });
    const nonCampsite = buildAsset({
      asset_id: 20,
      asset_code: 100,
      asset_name: 'Other structure',
    });

    vi.mocked(useGetAssetsByRecResourceId).mockReturnValue({
      data: [campsite, nonCampsite],
      isLoading: false,
      isError: false,
    } as any);

    render(<RecResourceAssetsSection />);

    expect(screen.getByText('By type')).toBeInTheDocument();
    expect(screen.getByText('By campsite')).toBeInTheDocument();
    // Defaults to grouping by type
    expect(screen.getByText('Other structure')).toBeInTheDocument();

    await user.click(screen.getByText('By campsite'));

    // "Campsite A" appears both in the CampsiteCard header and in the nested
    // AssetCard for the campsite itself, so scope to the accordion toggle.
    expect(
      screen.getByRole('button', { name: /Campsite A/ }),
    ).toBeInTheDocument();
  });

  it('opens and cancels the Add repair modal', async () => {
    const user = userEvent.setup();
    render(<RecResourceAssetsSection />);

    expect(screen.queryByText('Repair details')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Add repair/ }));

    expect(screen.getByText('Repair details')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByText('Repair details')).not.toBeInTheDocument();
  });

  it('opens the Add assets modal via Actions dropdown', async () => {
    const user = userEvent.setup();
    render(<RecResourceAssetsSection />);

    await user.click(screen.getByRole('button', { name: /Actions/ }));
    await user.click(screen.getByRole('button', { name: 'Add assets' }));

    expect(
      screen.getByRole('heading', { name: 'Add assets' }),
    ).toBeInTheDocument();
  });

  it('opens the Add campsites modal via Actions dropdown', async () => {
    const user = userEvent.setup();
    render(<RecResourceAssetsSection />);

    await user.click(screen.getByRole('button', { name: /Actions/ }));
    await user.click(screen.getByRole('button', { name: 'Add campsites' }));

    expect(
      screen.getByRole('heading', { name: 'Add campsites' }),
    ).toBeInTheDocument();
  });

  it('renders child assets under the campsite card in campsite view', async () => {
    const user = userEvent.setup();
    const campsite = buildAsset({
      asset_id: 10,
      asset_code: 227,
      asset_name: 'Campsite A',
      parent_id: null,
    });
    const child = buildAsset({
      asset_id: 20,
      asset_code: 100,
      asset_name: 'Child Asset',
      parent_id: 10,
    });

    vi.mocked(useGetAssetsByRecResourceId).mockReturnValue({
      data: [campsite, child],
      isLoading: false,
      isError: false,
    } as any);

    render(<RecResourceAssetsSection />);

    await user.click(screen.getByText('By campsite'));

    // Open the campsite accordion
    await user.click(screen.getByRole('button', { name: /Campsite A/ }));

    expect(screen.getByText('Child Asset')).toBeInTheDocument();
  });

  it('shows total value combining campsite and child assets in campsite view', async () => {
    const user = userEvent.setup();
    const campsite = buildAsset({
      asset_id: 10,
      asset_code: 227,
      asset_name: 'Campsite A',
      actual_value: 1000,
      parent_id: null,
    });
    const child = buildAsset({
      asset_id: 20,
      asset_code: 100,
      asset_name: 'Child Asset',
      actual_value: 500,
      parent_id: 10,
    });

    vi.mocked(useGetAssetsByRecResourceId).mockReturnValue({
      data: [campsite, child],
      isLoading: false,
      isError: false,
    } as any);

    render(<RecResourceAssetsSection />);

    await user.click(screen.getByText('By campsite'));

    // The CampsiteCard header shows the total value directly in the accordion toggle
    expect(
      screen.getByRole('button', { name: /Campsite A/ }),
    ).toBeInTheDocument();
    // Total value (1000 + 500) should appear somewhere in the rendered output
    expect(screen.getAllByText(/1,500/).length).toBeGreaterThanOrEqual(1);
  });

  it('closes the Add assets modal via cancel', async () => {
    const user = userEvent.setup();
    render(<RecResourceAssetsSection />);

    await user.click(screen.getByRole('button', { name: /Actions/ }));
    await user.click(screen.getByRole('button', { name: 'Add assets' }));

    expect(
      screen.getByRole('heading', { name: 'Add assets' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(
      screen.queryByRole('heading', { name: 'Add assets' }),
    ).not.toBeInTheDocument();
  });

  it('closes the Add campsites modal via cancel', async () => {
    const user = userEvent.setup();
    render(<RecResourceAssetsSection />);

    await user.click(screen.getByRole('button', { name: /Actions/ }));
    await user.click(screen.getByRole('button', { name: 'Add campsites' }));

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(
      screen.queryByRole('heading', { name: 'Add campsites' }),
    ).not.toBeInTheDocument();
  });

  it('shows validation error and blocks save when campsite form is invalid', async () => {
    const user = userEvent.setup();
    const campsite = buildAsset({
      asset_id: 10,
      asset_code: 227,
      asset_name: 'Campsite A',
    });
    vi.mocked(useGetAssetsByRecResourceId).mockReturnValue({
      data: [campsite],
      isLoading: false,
      isError: false,
    } as any);

    render(<RecResourceAssetsSection />);

    await user.click(screen.getByText('By campsite'));
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.clear(screen.getByLabelText('Latitude'));
    await user.type(screen.getByLabelText('Latitude'), '91');
    await user.clear(screen.getByLabelText('Longitude'));
    await user.type(screen.getByLabelText('Longitude'), '-123.1');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Please fix validation errors before saving.',
      'saveCampsite-validation',
    );
    expect(mockUpdateAsset).not.toHaveBeenCalled();
  });

  it('saves campsite edits and sets point geometry when latitude and longitude are present', async () => {
    const user = userEvent.setup();
    const campsite = buildAsset({
      asset_id: 10,
      asset_code: 227,
      asset_name: 'Campsite A',
    });
    vi.mocked(useGetAssetsByRecResourceId).mockReturnValue({
      data: [campsite],
      isLoading: false,
      isError: false,
    } as any);

    render(<RecResourceAssetsSection />);

    await user.click(screen.getByText('By campsite'));
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.clear(screen.getByLabelText('Latitude'));
    await user.type(screen.getByLabelText('Latitude'), '49.2');
    await user.clear(screen.getByLabelText('Longitude'));
    await user.type(screen.getByLabelText('Longitude'), '-123.1');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(mockUpdateAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        assetId: 10,
        recResourceId: 'REC123',
        dto: expect.objectContaining({
          latitude: 49.2,
          longitude: -123.1,
          geometry_type_code: 'PT',
        }),
      }),
    );
    expect(addSuccessNotification).toHaveBeenCalledWith(
      'Campsite assets updated successfully.',
      'saveCampsite-success',
    );
  });

  it('shows an error notification when inspection date update fails', async () => {
    const user = userEvent.setup();
    mockUpdateResource.mockRejectedValueOnce(new Error('boom'));

    render(<RecResourceAssetsSection />);

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(
      screen.getByRole('button', { name: 'Edit inspection dates' }),
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to update inspection dates. Please try again.',
      'updateInspections-error',
    );
  });
});
