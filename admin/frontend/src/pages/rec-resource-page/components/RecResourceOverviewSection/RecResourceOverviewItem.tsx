import { Stack } from "react-bootstrap";

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
      <Stack gap={1} className="border-start border-2 border-primary">
        <span className="text-primary fw-bold">{label}</span>
        <span className="text-secondary">
          {isHtml ? (
            <span dangerouslySetInnerHTML={{ __html: value }} />
          ) : (
            value
          )}
        </span>
      </Stack>
  );
};
