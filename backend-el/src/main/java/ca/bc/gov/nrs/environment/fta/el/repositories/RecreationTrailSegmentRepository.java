package ca.bc.gov.nrs.environment.fta.el.repositories;

import ca.bc.gov.nrs.environment.fta.el.entities.RecreationTrailSegment;
import ca.bc.gov.nrs.environment.fta.el.entities.RecreationTrailSegmentId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecreationTrailSegmentRepository extends JpaRepository<RecreationTrailSegment, RecreationTrailSegmentId> {
}
