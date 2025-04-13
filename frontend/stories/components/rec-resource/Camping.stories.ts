import type { Meta, StoryObj } from '@storybook/react';
import { Camping } from '@/components/rec-resource/section';

import '@/components/rec-resource/RecResource.scss';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Camping',
  component: Camping,
  parameters: {},
  args: {
    campsite_count: undefined,
    fees: [
      {
        fee_amount: 1,
        fee_start_date: new Date(),
        fee_end_date: new Date(),
        monday_ind: '',
        tuesday_ind: '',
        wednesday_ind: '',
        thursday_ind: '',
        friday_ind: '',
        saturday_ind: '',
        sunday_ind: '',
        recreation_fee_code: 'IF',
      },
    ],
  },
} satisfies Meta<typeof Camping>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    id: 'camping',
    fees: [
      {
        fee_amount: 1,
        fee_start_date: new Date(),
        fee_end_date: new Date(),
        monday_ind: '',
        tuesday_ind: '',
        wednesday_ind: '',
        thursday_ind: '',
        friday_ind: '',
        saturday_ind: '',
        sunday_ind: '',
        recreation_fee_code: 'H',
      },
    ],
  },
};

export const WithCampsiteCount: Story = {
  args: {
    id: 'camping',
    campsite_count: 15,
    fees: [
      {
        fee_amount: 1,
        fee_start_date: new Date(),
        fee_end_date: new Date(),
        monday_ind: '',
        tuesday_ind: '',
        wednesday_ind: '',
        thursday_ind: '',
        friday_ind: '',
        saturday_ind: '',
        sunday_ind: '',
        recreation_fee_code: 'H',
      },
    ],
  },
};

export const WithZeroCampsiteCount: Story = {
  args: {
    id: 'camping',
    campsite_count: 0,
    fees: [],
  },
};
