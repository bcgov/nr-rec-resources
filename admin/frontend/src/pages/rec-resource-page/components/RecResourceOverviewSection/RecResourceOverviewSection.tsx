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
        <RecResourceOverviewItem label="Name" value={recResource.name} />
        <RecResourceOverviewItem
          label="ID"
          value={recResource.rec_resource_id}
        />
        <RecResourceOverviewItem
          label="Closest Community"
          value={recResource.closest_community}
        />
        <RecResourceOverviewItem
          label="Type"
          value={recResource.rec_resource_type}
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
