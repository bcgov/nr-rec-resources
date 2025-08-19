import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a test query client with default options
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Wrapper for components that need only Router context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

// Wrapper for components that need only QueryClient context
const QueryWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Mock data factories
export const createMockRecResource = (overrides = {}) => ({
  rec_resource_id: 'REC1234',
  name: 'Test Recreation Site',
  description_summary: 'Test description',
  rec_resource_type: 'REC_SITE',
  access_type: ['FOURWD'],
  additional_fees: [
    {
      fee_description: 'Test Fee',
      fee_amount: 10,
    },
  ],
  campsite_count: 5,
  recreation_fee: [
    {
      fee_description: 'Camping Fee',
      recreation_fee_code: 'P',
      fee_amount: 15,
    },
  ],
  recreation_activity: [
    {
      activity_name: 'Camping',
      activity_description: 'Test camping activity',
    },
  ],
  recreation_structure: [
    {
      structure_name: 'Picnic Table',
      structure_description: 'Test structure',
    },
  ],
  status_code: 'OPEN',
  closure_start_date: null,
  closure_end_date: null,
  driving_directions: 'Test directions',
  spatial_geometry: {
    type: 'Point',
    coordinates: [-123.1207, 49.2827],
  },
  rec_resource_docs: [
    {
      doc_type: 'MAP',
      doc_url: 'https://example.com/map.pdf',
    },
  ],
  ...overrides,
});

export const createMockSiteOperator = (overrides = {}) => ({
  clientNumber: '0001',
  clientName: 'Test Site Operator',
  acronym: 'TSO',
  clientStatusCode: 'ACT',
  clientTypeCode: 'C',
  legalFirstName: undefined,
  legalMiddleName: undefined,
  ...overrides,
});

// Mock API responses
export const mockApiSuccess = (data: any) => ({
  data,
  isLoading: false,
  isError: false,
  error: null,
});

export const mockApiLoading = () => ({
  data: undefined,
  isLoading: true,
  isError: false,
  error: null,
});

export const mockApiError = (error: any) => ({
  data: undefined,
  isLoading: false,
  isError: true,
  error,
});

// Export everything including the original render function
export * from '@testing-library/react';
export { RouterWrapper, QueryWrapper, createTestQueryClient };
