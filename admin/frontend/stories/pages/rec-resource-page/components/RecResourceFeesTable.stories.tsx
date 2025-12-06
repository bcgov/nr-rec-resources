import { RecResourceFeesTable } from '@/pages/rec-resource-page/components/RecResourceFeesSection';
import { RecreationFeeDto } from '@/services';
import { Meta, StoryObj } from '@storybook/react';

// Sample fee data
const mockFees: RecreationFeeDto[] = [
  {
    fee_amount: 15,
    fee_start_date: new Date('2024-05-15'),
    fee_end_date: new Date('2024-10-15'),
    recreation_fee_code: 'D',
    fee_type_description: 'Day use',
    monday_ind: 'Y',
    tuesday_ind: 'Y',
    wednesday_ind: 'Y',
    thursday_ind: 'Y',
    friday_ind: 'Y',
    saturday_ind: 'Y',
    sunday_ind: 'N',
  },
  {
    fee_amount: 7,
    fee_start_date: new Date('2024-05-15'),
    fee_end_date: new Date('2024-10-15'),
    recreation_fee_code: 'T',
    fee_type_description: 'Trail use',
    monday_ind: 'Y',
    tuesday_ind: 'Y',
    wednesday_ind: 'Y',
    thursday_ind: 'Y',
    friday_ind: 'Y',
    saturday_ind: 'Y',
    sunday_ind: 'Y',
  },
  {
    fee_amount: 25,
    fee_start_date: new Date('2024-07-01'),
    fee_end_date: new Date('2024-08-31'),
    recreation_fee_code: 'C',
    fee_type_description: 'Camping',
    monday_ind: 'N',
    tuesday_ind: 'N',
    wednesday_ind: 'N',
    thursday_ind: 'N',
    friday_ind: 'Y',
    saturday_ind: 'Y',
    sunday_ind: 'Y',
  },
];

const meta: Meta<typeof RecResourceFeesTable> = {
  title: 'Pages/RecResourcePage/RecResourceFeesTable',
  component: RecResourceFeesTable,
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj<typeof RecResourceFeesTable>;

export const Default: Story = {
  args: {
    fees: mockFees,
  },
};

export const Empty: Story = {
  args: {
    fees: [],
  },
};

export const SingleFee: Story = {
  args: {
    fees: [mockFees[0]],
  },
};

export const MultipleFees: Story = {
  args: {
    fees: mockFees,
  },
};

export const FeeWithMissingData: Story = {
  args: {
    fees: [
      {
        recreation_fee_code: 'P',
        fee_type_description: 'Parking',
        fee_amount: undefined,
        fee_start_date: undefined,
        fee_end_date: undefined,
        monday_ind: 'N',
        tuesday_ind: 'N',
        wednesday_ind: 'N',
        thursday_ind: 'N',
        friday_ind: 'N',
        saturday_ind: 'N',
        sunday_ind: 'N',
      },
    ],
  },
};

export const FeeWithZeroAmount: Story = {
  args: {
    fees: [
      {
        ...mockFees[0],
        fee_amount: 0,
      },
    ],
  },
};

export const FeeWithWeekendOnly: Story = {
  args: {
    fees: [
      {
        fee_amount: 20,
        fee_start_date: new Date('2024-06-01'),
        fee_end_date: new Date('2024-09-30'),
        recreation_fee_code: 'D',
        fee_type_description: 'Day use',
        monday_ind: 'N',
        tuesday_ind: 'N',
        wednesday_ind: 'N',
        thursday_ind: 'N',
        friday_ind: 'N',
        saturday_ind: 'Y',
        sunday_ind: 'Y',
      },
    ],
  },
};

export const FeeWithWeekdayOnly: Story = {
  args: {
    fees: [
      {
        fee_amount: 12,
        fee_start_date: new Date('2024-06-01'),
        fee_end_date: new Date('2024-09-30'),
        recreation_fee_code: 'D',
        fee_type_description: 'Day use',
        monday_ind: 'Y',
        tuesday_ind: 'Y',
        wednesday_ind: 'Y',
        thursday_ind: 'Y',
        friday_ind: 'Y',
        saturday_ind: 'N',
        sunday_ind: 'N',
      },
    ],
  },
};
