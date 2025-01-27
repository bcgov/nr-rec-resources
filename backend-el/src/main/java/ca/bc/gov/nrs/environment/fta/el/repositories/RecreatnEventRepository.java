package ca.bc.gov.nrs.environment.fta.el.repositories;

import ca.bc.gov.nrs.environment.fta.el.entities.RecreatnEvent;
import ca.bc.gov.nrs.environment.fta.el.entities.RecreatnEventId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecreatnEventRepository extends JpaRepository<RecreatnEvent, RecreatnEventId> {
}
