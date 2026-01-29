import { Stack } from 'react-bootstrap';

type FieldItemProps =
  | {
      label: string;
      value: string;
      isHtml: true;
    }
  | {
      label: string;
      value: React.ReactNode;
      isHtml?: false;
    };

export const FieldItem = ({ label, value, isHtml }: FieldItemProps) => {
  const renderContent = () => {
    if (!value) {
      return '-';
    }

    if (isHtml) {
      return <div dangerouslySetInnerHTML={{ __html: value as string }} />;
    }

    return value;
  };

  return (
    <Stack
      gap={1}
      className="border-start border-2 border-primary ps-3 h-100"
      as="section"
      role="region"
      aria-labelledby={`overview-${label.toLowerCase()}`}
    >
      <span className="text-primary fw-bold">{label}</span>
      <div className="text-secondary">{renderContent()}</div>
    </Stack>
  );
};
