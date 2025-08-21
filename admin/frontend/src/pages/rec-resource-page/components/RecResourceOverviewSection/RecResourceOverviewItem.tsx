import { Col, ColProps, Stack } from "react-bootstrap";

type RecResourceOverviewItemProps =
  | {
      label: string;
      value: string;
      isHtml: true;
      colProps?: ColProps;
    }
  | {
      label: string;
      value: React.ReactNode;
      isHtml?: false;
      colProps?: ColProps;
    };

export const RecResourceOverviewItem = ({
  label,
  value,
  colProps = { xs: 12, md: 6, lg: 4 },
  isHtml,
}: RecResourceOverviewItemProps) => {
  if (!value) return null;
  return (
    <Col {...colProps} className="mb-3">
      <Stack gap={1}>
        <span className="fw-bold text-dark">{label}</span>
        {isHtml ? (
          <span dangerouslySetInnerHTML={{ __html: value }} />
        ) : (
          <span>{value}</span>
        )}
      </Stack>
    </Col>
  );
};
