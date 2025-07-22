import type { Meta, StoryObj } from '@storybook/react-vite';
import AdditionalFees from '@/components/rec-resource/section/AdditionalFees';

import '@/components/rec-resource/RecResource.scss';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'AdditionalFees',
  component: AdditionalFees,
  parameters: {},
} satisfies Meta<typeof AdditionalFees>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    id: 'AdditionalFees',
    fees: [
      {
        fee_amount: 1,
        fee_start_date: new Date(),
        fee_end_date: new Date(),
        recreation_fee_code: 'H',
        monday_ind: 'Y',
        tuesday_ind: 'Y',
        wednesday_ind: 'Y',
        thursday_ind: '',
        friday_ind: '',
        saturday_ind: '',
        sunday_ind: '',
      },
      {
        fee_amount: 1,
        fee_start_date: new Date(),
        fee_end_date: new Date(),
        recreation_fee_code: 'H',
        monday_ind: 'Y',
        tuesday_ind: 'Y',
        wednesday_ind: 'Y',
        thursday_ind: '',
        friday_ind: '',
        saturday_ind: '',
        sunday_ind: '',
      },
      {
        fee_amount: 1,
        fee_start_date: new Date(),
        fee_end_date: new Date(),
        recreation_fee_code: 'H',
        monday_ind: 'Y',
        tuesday_ind: 'Y',
        wednesday_ind: 'Y',
        thursday_ind: '',
        friday_ind: '',
        saturday_ind: '',
        sunday_ind: '',
      },
    ],
  },
};
