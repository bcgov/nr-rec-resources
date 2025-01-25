package ca.bc.gov.nrs.environment.fta.el.repositories;

import ca.bc.gov.nrs.environment.fta.el.entities.RecreationAccess;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecreationAccessRepository extends JpaRepository<RecreationAccess, String> {
}
