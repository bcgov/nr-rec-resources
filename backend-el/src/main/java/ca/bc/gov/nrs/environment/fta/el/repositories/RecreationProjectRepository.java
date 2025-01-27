package ca.bc.gov.nrs.environment.fta.el.repositories;

import ca.bc.gov.nrs.environment.fta.el.entities.RecreationProject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecreationProjectRepository extends JpaRepository<RecreationProject, String> {
}
