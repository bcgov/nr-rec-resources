import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RecResourceGeospatialEditSection } from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/EditSection';

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    Controller: ({ render }: any) => {
      const field = {
        value: undefined,
        onChange: vi.fn(),
        onBlur: vi.fn(),
      };
      return render({ field });
    },
  };
});

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceGeospatialSection/EditSection/hooks',
  () => ({
    useEditGeospatialForm: () => ({
      handleSubmit: (fn: any) => (e?: any) => {
        e?.preventDefault?.();
        return fn();
      },
      control: {} as any,
      errors: {},
      isDirty: true,
      isSubmitting: false,
      onSubmit: vi.fn(),
    }),
  }),
);

vi.mock('@/routes/rec-resource/$id/geospatial/edit', () => ({
  Route: {
    useLoaderData: () => ({
      geospatialData: {
        latitude: 49.123456,
        longitude: -123.654321,
      },
    }),
    useParams: () => ({ id: 'REC123' }),
  },
}));

vi.mock('@shared/components/link-with-query-params', () => ({
  LinkWithQueryParams: ({ children, ...props }: any) => (
    <a {...props}>{children}</a>
  ),
}));

describe('RecResourceGeospatialEditSection', () => {
  it('renders header and action buttons', () => {
    render(<RecResourceGeospatialEditSection />);

    expect(screen.getByText('Edit Geospatial')).toBeDefined();
    expect(
      screen.getByRole('button', { name: /Save|Saving\.\.\./ }),
    ).toBeDefined();
    expect(screen.getByText('Cancel')).toBeDefined();
  });

  it('displays computed latitude and longitude', () => {
    render(<RecResourceGeospatialEditSection />);

    expect(screen.getByText('Latitude')).toBeDefined();
    expect(screen.getByText('Longitude')).toBeDefined();

    const latitudeInput = screen.getByDisplayValue(
      '49.123456',
    ) as HTMLInputElement;
    const longitudeInput = screen.getByDisplayValue(
      '-123.654321',
    ) as HTMLInputElement;

    expect(latitudeInput.disabled).toBe(true);
    expect(longitudeInput.disabled).toBe(true);
  });
});
