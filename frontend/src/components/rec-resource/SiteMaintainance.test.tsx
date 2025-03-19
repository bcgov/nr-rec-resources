import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SiteMaintenance from './SiteMaintainance';

describe('Sitemaintenance Component', () => {
  test("renders correct maintenance message for 'M' code", () => {
    render(
      <SiteMaintenance data={[{ id: 1, recreation_maintenance_code: 'M' }]} />,
    );
    expect(screen.getByText('Maintenance Type')).toBeInTheDocument();
    expect(
      screen.getByText(
        'This site is maintained to Recreation Sites & Trails BC standards by partners or contractors.',
      ),
    ).toBeInTheDocument();
  });

  test("renders correct maintenance message for 'U' code", () => {
    render(
      <SiteMaintenance data={[{ id: 2, recreation_maintenance_code: 'U' }]} />,
    );
    expect(screen.getByText('Maintenance Type')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Limited maintenance services are provided at this site. Please respect the environment and pack out what you pack in.',
      ),
    ).toBeInTheDocument();
  });

  test('renders unknown maintenance message for unknown code', () => {
    render(
      <SiteMaintenance data={[{ id: 3, recreation_maintenance_code: 'X' }]} />,
    );
    expect(screen.getByText('Maintenance Type')).toBeInTheDocument();
    expect(screen.getByText('Unknown maintenance status')).toBeInTheDocument();
  });

  test('does not render anything when data is empty', () => {
    const { container } = render(<SiteMaintenance data={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
