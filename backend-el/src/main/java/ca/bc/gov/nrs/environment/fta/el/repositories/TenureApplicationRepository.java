package ca.bc.gov.nrs.environment.fta.el.repositories;

import ca.bc.gov.nrs.environment.fta.el.entities.TenureApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface TenureApplicationRepository extends JpaRepository<TenureApplication, Long> {

  @Query(value = """
      SELECT ta.*
      FROM THE.TENURE_APPLICATION ta
      WHERE ta.TENURE_APPLICATION_TYPE_CODE IN (:typeCodes)
      ORDER BY ta.TENURE_APP_ID
      """, nativeQuery = true)
  List<TenureApplication> findAllByTenureApplicationTypeCodes(@Param("typeCodes") Collection<String> typeCodes);
}
