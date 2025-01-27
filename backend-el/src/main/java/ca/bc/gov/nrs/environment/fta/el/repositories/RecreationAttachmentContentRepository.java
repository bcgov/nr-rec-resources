package ca.bc.gov.nrs.environment.fta.el.repositories;

import ca.bc.gov.nrs.environment.fta.el.entities.RecreationAttachmentContent;
import ca.bc.gov.nrs.environment.fta.el.entities.RecreationAttachmentContentId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecreationAttachmentContentRepository extends JpaRepository<RecreationAttachmentContent, RecreationAttachmentContentId> {
  List<RecreationAttachmentContent> findAllByForestFileId(String forestFileId);
}
