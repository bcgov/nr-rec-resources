package ca.bc.gov.nrs.environment.fta.el.repositories;

import ca.bc.gov.nrs.environment.fta.el.entities.RecreationDistrictXref;
import ca.bc.gov.nrs.environment.fta.el.entities.RecreationDistrictXrefId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecreationDistrictXrefRepository extends JpaRepository<RecreationDistrictXref, RecreationDistrictXrefId> {
}
