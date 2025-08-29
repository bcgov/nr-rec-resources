import { Stack } from 'react-bootstrap';

type RecResourceOverviewItemProps =
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

export const RecResourceOverviewItem = ({
  label,
  value,
  isHtml,
}: RecResourceOverviewItemProps) => {
  if (!value) return null;

  return (
    <Stack
      gap={1}
      className="border-start border-2 border-primary ps-3 h-100"
      as="section"
      role="region"
      aria-labelledby={`overview-${label.toLowerCase()}`}
    >
      <span className="text-primary fw-bold">{label}</span>
      <div className="text-secondary">
        {isHtml ? (
          <div dangerouslySetInnerHTML={{ __html: value as string }} />
        ) : (
          value
        )}
      </div>
    </Stack>
  );
};
