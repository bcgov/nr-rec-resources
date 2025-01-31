package ca.bc.gov.nrs.environment.fta.el.repositories;

import ca.bc.gov.nrs.environment.fta.el.entities.RecreationAccessCode;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecreationAccessCodeRepository extends JpaRepository<RecreationAccessCode, String> {
  }
