package ca.bc.gov.nrs.environment.fta.el.repositories;

import ca.bc.gov.nrs.environment.fta.el.entities.RecreationDefinedCampsite;
import ca.bc.gov.nrs.environment.fta.el.entities.RecreationDefinedCampsiteId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecreationDefinedCampsiteRepository extends JpaRepository<RecreationDefinedCampsite, RecreationDefinedCampsiteId> {
}
