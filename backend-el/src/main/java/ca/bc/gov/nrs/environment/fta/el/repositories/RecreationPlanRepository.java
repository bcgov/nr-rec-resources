package ca.bc.gov.nrs.environment.fta.el.repositories;

import ca.bc.gov.nrs.environment.fta.el.entities.RecreationPlan;
import ca.bc.gov.nrs.environment.fta.el.entities.RecreationPlanId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecreationPlanRepository extends JpaRepository<RecreationPlan, RecreationPlanId> {
}
