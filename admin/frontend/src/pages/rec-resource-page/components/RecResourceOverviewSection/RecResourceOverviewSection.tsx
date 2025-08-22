import type { RecreationResourceDetailModel } from "@/services";
import { Row, Stack } from "react-bootstrap";
import { StyledAccordion } from "../StyledAccordion/StyledAccordion";
import { RecResourceOverviewItem } from "./RecResourceOverviewItem";

type RecResourceOverviewSectionProps = {
  recResource: RecreationResourceDetailModel;
};

export const RecResourceOverviewSection = (
  props: RecResourceOverviewSectionProps,
) => {
  const { recResource } = props;
  return (
    <StyledAccordion eventKey="overview" title="Overview">
      <Stack direction="vertical" gap={4}>
        {/* Description - full width */}
        <Row>
          <RecResourceOverviewItem
            label="Description"
            value={recResource.description}
            colProps={{ xs: 12 }}
            isHtml
          />
        </Row>

        {/* Key attributes grouped in a card */}
        <Row className="gy-3">
          <RecResourceOverviewItem
            label="Closest Community"
            value={recResource.closest_community}
            colProps={{ xs: 12, md: 6 }}
          />
          <RecResourceOverviewItem
            label="Recreation District"
            value={recResource.recreation_district?.description}
            colProps={{ xs: 12, md: 6 }}
          />
          <RecResourceOverviewItem
            label="Access Type"
            value={recResource.rec_resource_type}
            colProps={{ xs: 12, md: 6 }}
          />
          <RecResourceOverviewItem
            label="Maintenance Type"
            value={recResource.maintenance_standard_description}
            colProps={{ xs: 12, md: 6 }}
          />
          <RecResourceOverviewItem
            label="Status"
            value={recResource.recreation_status?.description}
            colProps={{ xs: 12, md: 6 }}
          />
        </Row>

        {/* Driving Directions - full width */}
        <Row>
          <RecResourceOverviewItem
            label="Driving Directions"
            value={recResource.driving_directions}
            colProps={{ xs: 12 }}
            isHtml
          />
        </Row>
      </Stack>
    </StyledAccordion>
  );
};
