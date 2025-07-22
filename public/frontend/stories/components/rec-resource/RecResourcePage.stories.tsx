import type { Meta, StoryObj } from '@storybook/react-vite';
import { RecResourcePage } from '@/components/rec-resource';
import { mockHandlers } from './mockHandlers';
import {
  MOCK_CAMPING_FEE_DATA,
  MOCK_RECREATION_SITE,
  MOCK_RECREATION_SITE_IMAGES,
} from './mockData';
import { QueryClient, QueryClientProvider } from '~/@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RecreationResourceDetailModel } from '@/service/custom-models';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      retry: false,
    },
  },
});

/**
 * Recreation Resource Page Component
 * @component
 * @description Displays detailed information about a recreation site including photos,
 * facilities, fees, and activities
 */
const meta: Meta<typeof RecResourcePage> = {
  title: 'Pages/RecResourcePage',
  component: RecResourcePage,
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [mockHandlers.getDefaultResource],
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/recreation-resource/REC123']}>
          <Routes>
            <Route path="/recreation-resource/:id" element={<Story />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RecResourcePage>;

// Story variants using shared mock handler creator
const createStoryWithApiQueryResponse = (
  response: Partial<RecreationResourceDetailModel>,
): Story => ({
  parameters: {
    msw: {
      handlers: [
        mockHandlers.createResourceHandler({
          ...MOCK_RECREATION_SITE,
          ...response,
        }),
      ],
    },
  },
});

export const WithPhotos: Story = createStoryWithApiQueryResponse({
  recreation_resource_images: MOCK_RECREATION_SITE_IMAGES,
});

export const WithZeroCampsitesAndNoFees: Story =
  createStoryWithApiQueryResponse({
    campsite_count: 0,
  });

export const WithCampingAndFees: Story = createStoryWithApiQueryResponse({
  recreation_fee: [MOCK_CAMPING_FEE_DATA],
} as any);

export const WithOnlyCampingFees: Story = createStoryWithApiQueryResponse({
  campsite_count: undefined,
  recreation_fee: [MOCK_CAMPING_FEE_DATA],
} as any);

export const WithCampingAndAdditionalFees: Story =
  createStoryWithApiQueryResponse({
    campsite_count: 15,
    recreation_fee: [MOCK_CAMPING_FEE_DATA],
    additional_fees: [MOCK_CAMPING_FEE_DATA],
  } as any);

export const WithOnlyAdditionalFees: Story = createStoryWithApiQueryResponse({
  campsite_count: undefined,
  additional_fees: [MOCK_CAMPING_FEE_DATA],
} as any);
