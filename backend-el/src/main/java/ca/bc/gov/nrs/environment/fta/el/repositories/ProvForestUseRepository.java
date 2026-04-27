package ca.bc.gov.nrs.environment.fta.el.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import ca.bc.gov.nrs.environment.fta.el.entities.ProvForestUse;

public interface ProvForestUseRepository extends JpaRepository<ProvForestUse, String> {
  List<ProvForestUse> findByFileTypeCode(String fileTypeCode);
}
