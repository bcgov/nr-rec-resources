package ca.bc.gov.nrs.environment.fta.el.repositories;

import ca.bc.gov.nrs.environment.fta.el.entities.RecreationSearchResult;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecreationSearchResultRepository extends JpaRepository<RecreationSearchResult, String> {
}
