import { RecResourceAssetsSection } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/RecResourceAssetsSection';
import type {
  Asset,
  AssetCode,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import {
  useGetAssetCodes,
  useGetAssetsByRecResourceId,
  useGetRecreationResourceById,
  useGetRepairCodes,
} from '@/services/hooks/recreation-resource-admin';
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
  useGetAssetCodes: vi.fn(),
  useGetAssetsByRecResourceId: vi.fn(),
  useGetRecreationResourceById: vi.fn(),
  useGetRepairCodes: vi.fn(),
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
  default_value: null,
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

    expect(screen.getByText('Structures')).toBeInTheDocument();
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

  it('renders the Add campsite button', () => {
    render(<RecResourceAssetsSection />);

    expect(
      screen.getByRole('button', { name: /Add campsite/ }),
    ).toBeInTheDocument();
  });
});
