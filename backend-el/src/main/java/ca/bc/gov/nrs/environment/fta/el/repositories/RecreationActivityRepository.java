package ca.bc.gov.nrs.environment.fta.el.repositories;

import ca.bc.gov.nrs.environment.fta.el.entities.RecreationActivity;
import ca.bc.gov.nrs.environment.fta.el.entities.RecreationActivityId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecreationActivityRepository extends JpaRepository<RecreationActivity, RecreationActivityId> {
}
