import { Row, Stack } from "react-bootstrap";
import { StyledAccordion } from "../StyledAccordion/StyledAccordion";
import { RecResourceOverviewItem } from "./RecResourceOverviewItem";
import { RecreationResourceDetailUIModel } from "@/services/recreation-resource-admin";

type RecResourceOverviewSectionProps = {
  recResource: RecreationResourceDetailUIModel;
};

export const RecResourceOverviewSection = (
  props: RecResourceOverviewSectionProps,
) => {
  const { recResource } = props;
  return (
    <StyledAccordion eventKey="overview" title="Overview">
      <Stack direction="vertical" gap={4}>
        <Row xs={12}>
          <RecResourceOverviewItem
            label="Description"
            value={recResource.description}
            isHtml
          />
        </Row>

        <Row className="gy-3" xs={12} md={2} lg={3}>
          <RecResourceOverviewItem
            label="Closest Community"
            value={recResource.closest_community}
          />
          <RecResourceOverviewItem
            label="Recreation District"
            value={recResource.recreation_district_description}
          />
          <RecResourceOverviewItem
            label="Access Type"
            value={recResource.rec_resource_type}
          />
          <RecResourceOverviewItem
            label="Maintenance Type"
            value={recResource.maintenance_standard_description}
          />
        </Row>

        <Row xs={12}>
          <RecResourceOverviewItem
            label="Driving Directions"
            value={recResource.driving_directions}
            isHtml
          />
        </Row>
      </Stack>
    </StyledAccordion>
  );
};
