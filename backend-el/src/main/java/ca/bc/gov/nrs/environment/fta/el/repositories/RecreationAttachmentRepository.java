package ca.bc.gov.nrs.environment.fta.el.repositories;

import ca.bc.gov.nrs.environment.fta.el.entities.RecreationAttachment;
import ca.bc.gov.nrs.environment.fta.el.entities.RecreationAttachmentId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecreationAttachmentRepository extends JpaRepository<RecreationAttachment, RecreationAttachmentId> {
}
