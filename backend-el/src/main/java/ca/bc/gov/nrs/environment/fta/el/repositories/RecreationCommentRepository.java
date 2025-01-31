package ca.bc.gov.nrs.environment.fta.el.repositories;

import ca.bc.gov.nrs.environment.fta.el.entities.RecreationComment;
import ca.bc.gov.nrs.environment.fta.el.entities.RecreationCommentId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecreationCommentRepository extends JpaRepository<RecreationComment, RecreationCommentId> {
}
