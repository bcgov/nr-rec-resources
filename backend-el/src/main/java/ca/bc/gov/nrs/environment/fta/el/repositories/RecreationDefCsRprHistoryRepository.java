package ca.bc.gov.nrs.environment.fta.el.repositories;

import ca.bc.gov.nrs.environment.fta.el.entities.RecreationDefCsRprHistory;
import ca.bc.gov.nrs.environment.fta.el.entities.RecreationDefCsRprHistoryId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecreationDefCsRprHistoryRepository extends JpaRepository<RecreationDefCsRprHistory, RecreationDefCsRprHistoryId> {
}
