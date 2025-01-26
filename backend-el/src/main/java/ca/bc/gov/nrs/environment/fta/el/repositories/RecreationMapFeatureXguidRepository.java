package ca.bc.gov.nrs.environment.fta.el.repositories;

import ca.bc.gov.nrs.environment.fta.el.entities.RecreationMapFeatureXguid;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecreationMapFeatureXguidRepository extends JpaRepository<RecreationMapFeatureXguid, byte[]> {
}
