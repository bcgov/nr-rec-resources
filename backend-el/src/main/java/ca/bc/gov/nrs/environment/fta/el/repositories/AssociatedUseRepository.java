package ca.bc.gov.nrs.environment.fta.el.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import ca.bc.gov.nrs.environment.fta.el.entities.AssociatedUse;
import ca.bc.gov.nrs.environment.fta.el.entities.AssociatedUseId;

public interface AssociatedUseRepository extends JpaRepository<AssociatedUse, AssociatedUseId> {
  List<AssociatedUse> findByForestFileIdStartingWith(String prefix);
}
