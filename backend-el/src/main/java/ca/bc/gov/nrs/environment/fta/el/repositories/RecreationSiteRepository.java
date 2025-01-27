package ca.bc.gov.nrs.environment.fta.el.repositories;

import ca.bc.gov.nrs.environment.fta.el.entities.RecreationSite;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecreationSiteRepository extends JpaRepository<RecreationSite, String> {
}
