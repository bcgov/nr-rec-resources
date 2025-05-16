import { FC } from 'react';
import { Stack } from 'react-bootstrap';
import './RecreationSearchBanner.scss';
import { RecreationSearchForm } from '@/components/recreation-search-form';

export const RecreationSearchBanner: FC = () => {
  return (
    <section
      className={
        'search-banner-container w-100 d-flex flex-column align-items-center'
      }
    >
      {/* Search input container */}
      <section className="search-container rounded-2">
        <Stack direction={'vertical'} gap={3}>
          <h2 className="search-title fs-4">
            Find a recreation{' '}
            <span className="d-inline-block">site or trail</span>
          </h2>
          <RecreationSearchForm
            searchButtonProps={{ variant: 'light', className: 'search-btn' }}
            location="Landing page"
          />
        </Stack>
      </section>
    </section>
  );
};
