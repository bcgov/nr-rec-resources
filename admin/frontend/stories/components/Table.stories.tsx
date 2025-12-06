import { CustomBadge, Table } from '@/components';
import { COLOR_BLUE, COLOR_BLUE_LIGHT } from '@/styles/colors';
import { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj<typeof Table>;

// Sample data types
interface FeeData {
  feeType: string;
  amount: number | null;
  startDate: string;
  endDate: string;
  days: string[];
}

interface UserData {
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

// Sample fee data
const sampleFees: FeeData[] = [
  {
    feeType: 'Parking',
    amount: 5.0,
    startDate: 'May 1, 2025',
    endDate: 'October 31, 2025',
    days: ['All days'],
  },
  {
    feeType: 'Day Use',
    amount: 15.0,
    startDate: 'June 1, 2025',
    endDate: 'September 30, 2025',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  },
  {
    feeType: 'Camping',
    amount: 25.0,
    startDate: 'July 1, 2025',
    endDate: 'August 31, 2025',
    days: ['Sat', 'Sun'],
  },
];

// Sample user data
const sampleUsers: UserData[] = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    status: 'active',
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'User',
    status: 'active',
  },
  {
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'Viewer',
    status: 'inactive',
  },
];

export const FeesTable: Story = {
  render: () => (
    <Table<FeeData>
      columns={[
        {
          header: 'Fee Type',
          render: (fee) => (
            <CustomBadge
              label={fee.feeType}
              bgColor={COLOR_BLUE_LIGHT}
              textColor={COLOR_BLUE}
            />
          ),
        },
        {
          header: 'Amount',
          render: (fee) =>
            fee.amount !== null ? `$${fee.amount.toFixed(2)}` : '--',
        },
        {
          header: 'Start Date',
          render: (fee) => fee.startDate,
        },
        {
          header: 'End Date',
          render: (fee) => fee.endDate,
        },
        {
          header: 'Days',
          render: (fee) => (
            <div className="d-flex flex-wrap gap-1">
              {fee.days.map((day, index) => (
                <CustomBadge
                  key={`${day}-${index}`}
                  label={day}
                  bgColor={COLOR_BLUE_LIGHT}
                  textColor={COLOR_BLUE}
                />
              ))}
            </div>
          ),
        },
      ]}
      rows={sampleFees}
      getRowKey={(fee, index) => `${fee.feeType}-${index}`}
      emptyMessage="Currently no fees"
    />
  ),
};

export const UsersTable: Story = {
  render: () => (
    <Table<UserData>
      columns={[
        {
          header: 'Name',
          render: (user) => user.name,
        },
        {
          header: 'Email',
          render: (user) => user.email,
        },
        {
          header: 'Role',
          render: (user) => user.role,
        },
        {
          header: 'Status',
          render: (user) => (
            <CustomBadge
              label={user.status}
              bgColor={user.status === 'active' ? COLOR_BLUE_LIGHT : '#f0f0f0'}
              textColor={user.status === 'active' ? COLOR_BLUE : '#666'}
            />
          ),
        },
      ]}
      rows={sampleUsers}
      getRowKey={(user, index) => `${user.email}-${index}`}
      emptyMessage="No users found"
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <Table<FeeData>
      columns={[
        {
          header: 'Fee Type',
          render: () => null,
        },
        {
          header: 'Amount',
          render: () => null,
        },
        {
          header: 'Start Date',
          render: () => null,
        },
        {
          header: 'End Date',
          render: () => null,
        },
        {
          header: 'Days',
          render: () => null,
        },
      ]}
      rows={[]}
      getRowKey={() => ''}
      emptyMessage="Currently no fees"
    />
  ),
};

export const EmptyWithCustomMessage: Story = {
  render: () => (
    <Table<FeeData>
      columns={[
        {
          header: 'Fee Type',
          render: () => null,
        },
        {
          header: 'Amount',
          render: () => null,
        },
      ]}
      rows={[]}
      getRowKey={() => ''}
      emptyMessage="No data has been configured"
    />
  ),
};

export const SingleRow: Story = {
  render: () => (
    <Table<FeeData>
      columns={[
        {
          header: 'Fee Type',
          render: (fee) => (
            <CustomBadge
              label={fee.feeType}
              bgColor={COLOR_BLUE_LIGHT}
              textColor={COLOR_BLUE}
            />
          ),
        },
        {
          header: 'Amount',
          render: (fee) =>
            fee.amount !== null ? `$${fee.amount.toFixed(2)}` : '--',
        },
        {
          header: 'Start Date',
          render: (fee) => fee.startDate,
        },
        {
          header: 'End Date',
          render: (fee) => fee.endDate,
        },
        {
          header: 'Days',
          render: (fee) => (
            <div className="d-flex flex-wrap gap-1">
              {fee.days.map((day, index) => (
                <CustomBadge
                  key={`${day}-${index}`}
                  label={day}
                  bgColor={COLOR_BLUE_LIGHT}
                  textColor={COLOR_BLUE}
                />
              ))}
            </div>
          ),
        },
      ]}
      rows={[sampleFees[0]]}
      getRowKey={(fee, index) => `${fee.feeType}-${index}`}
      emptyMessage="Currently no fees"
    />
  ),
};

export const ManyRows: Story = {
  render: () => (
    <Table<FeeData>
      columns={[
        {
          header: 'Fee Type',
          render: (fee) => (
            <CustomBadge
              label={fee.feeType}
              bgColor={COLOR_BLUE_LIGHT}
              textColor={COLOR_BLUE}
            />
          ),
        },
        {
          header: 'Amount',
          render: (fee) =>
            fee.amount !== null ? `$${fee.amount.toFixed(2)}` : '--',
        },
        {
          header: 'Start Date',
          render: (fee) => fee.startDate,
        },
        {
          header: 'End Date',
          render: (fee) => fee.endDate,
        },
        {
          header: 'Days',
          render: (fee) => (
            <div className="d-flex flex-wrap gap-1">
              {fee.days.map((day, index) => (
                <CustomBadge
                  key={`${day}-${index}`}
                  label={day}
                  bgColor={COLOR_BLUE_LIGHT}
                  textColor={COLOR_BLUE}
                />
              ))}
            </div>
          ),
        },
      ]}
      rows={[
        ...sampleFees,
        {
          feeType: 'Trail Use',
          amount: 10.0,
          startDate: 'January 1, 2025',
          endDate: 'December 31, 2025',
          days: ['All days'],
        },
        {
          feeType: 'Hut',
          amount: 50.0,
          startDate: 'May 15, 2025',
          endDate: 'September 15, 2025',
          days: ['Fri', 'Sat', 'Sun'],
        },
      ]}
      getRowKey={(fee, index) => `${fee.feeType}-${index}`}
      emptyMessage="Currently no fees"
    />
  ),
};
