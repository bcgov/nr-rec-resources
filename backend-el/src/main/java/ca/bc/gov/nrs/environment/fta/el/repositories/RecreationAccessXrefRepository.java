package ca.bc.gov.nrs.environment.fta.el.repositories;

import ca.bc.gov.nrs.environment.fta.el.entities.RecreationAccessXref;
import ca.bc.gov.nrs.environment.fta.el.entities.RecreationAccessXrefId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecreationAccessXrefRepository extends JpaRepository<RecreationAccessXref, RecreationAccessXrefId> {
}
