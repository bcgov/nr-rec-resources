import type { RecreationResourceDetailDto } from "@/services/recreation-resource-admin/models/RecreationResourceDetailDto";
import { Row } from "react-bootstrap";
import { StyledAccordion } from "../StyledAccordion/StyledAccordion";
import { RecResourceOverviewItem } from "./RecResourceOverviewItem";

type RecResourceOverviewSectionProps = {
  recResource: RecreationResourceDetailDto;
};

export const RecResourceOverviewSection = ({
  recResource,
}: RecResourceOverviewSectionProps) => {
  return (
    <StyledAccordion eventKey="overview" title="Overview">
      <Row>
        <RecResourceOverviewItem
          label="Closest Community"
          value={recResource.closest_community}
        />
        <RecResourceOverviewItem
          label="Recreation District"
          value={recResource.recreation_district?.description}
        />
        <RecResourceOverviewItem
          label="Access Type"
          value={recResource.rec_resource_type}
        />
        <RecResourceOverviewItem
          label="Maintenance Type"
          value={
            recResource.maintenance_standard_code === "M"
              ? "Maintained"
              : recResource.maintenance_standard_code === "U"
                ? "User Maintained"
                : recResource.maintenance_standard_code
          }
        />
        <RecResourceOverviewItem
          label="Status"
          value={recResource.recreation_status?.description}
        />
        <RecResourceOverviewItem
          label="Description"
          value={recResource.description}
          colProps={{ xs: 12 }}
          isHtml
        />
      </Row>
    </StyledAccordion>
  );
};
