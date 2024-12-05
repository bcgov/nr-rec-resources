import App from '@/App';
import { act, render, screen } from '@testing-library/react';
import apiService from '@/service/api-service';

vi.spyOn(apiService as any, 'getAxiosInstance').mockReturnValue({
  get: vi.fn().mockResolvedValue({}),
});

describe('Simple working test', () => {
  it('the title is visible', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(
      screen.getByText(/Recreation Sites and Trails BC/i),
    ).toBeInTheDocument();
  });
});
